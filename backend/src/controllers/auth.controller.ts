import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { ERROR_CODES } from '../constants/error-codes';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
});

export async function register(req: Request, res: Response) {
  try {
    const body = registerSchema.parse(req.body);
    const user = await authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.dateOfBirth
    );
    res.status(201).json({ message: 'Compte créé. Vérifiez votre email.', user });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ERROR_CODES.EMAIL_TAKEN) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.params;
    await authService.verifyEmail(token);
    res.json({ message: 'Email vérifié avec succès.' });
  } catch {
    res.status(400).json({ message: 'Token invalide.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ERROR_CODES.INVALID_CREDENTIALS) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch {
    res.status(401).json({ message: 'Refresh token invalide.' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Déconnecté.' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: 'Si cet email existe, un lien vous a été envoyé.' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch {
    res.status(400).json({ message: 'Token invalide ou expiré.' });
  }
}
