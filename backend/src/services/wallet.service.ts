import { PKPass } from '@walletpass/pass-js';
import { prisma } from '../utils/prisma';
import { config } from '../utils/config';
import { ERROR_CODES } from '../constants/error-codes';

/**
 * Retourne un Buffer contenant le fichier .pkpass signé pour un utilisateur.
 *
 * Prérequis Apple Wallet (à configurer dans .env) :
 *   APPLE_WALLET_TEAM_ID      — ex. AB12CD34EF
 *   APPLE_WALLET_PASS_TYPE_ID — ex. pass.fr.tete-dans-les-nuages.card
 *   APPLE_WALLET_CERT_PEM     — certificat Pass Type ID en base64
 *   APPLE_WALLET_KEY_PEM      — clé privée en base64
 *   APPLE_WALLET_WWDR_PEM     — cert WWDR Apple en base64
 *   APPLE_WALLET_KEY_PASSPHRASE — passphrase de la clé (optionnel)
 */
export async function generateWalletPass(userId: string): Promise<Buffer> {
  const card = await prisma.card.findUnique({ where: { userId } });
  if (!card) throw new Error(ERROR_CODES.CARD_NOT_FOUND);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  if (!config.APPLE_WALLET_CERT_PEM || !config.APPLE_WALLET_KEY_PEM || !config.APPLE_WALLET_WWDR_PEM) {
    throw new Error(ERROR_CODES.WALLET_CERTS_MISSING);
  }

  const certPem = Buffer.from(config.APPLE_WALLET_CERT_PEM, 'base64').toString('utf-8');
  const keyPem = Buffer.from(config.APPLE_WALLET_KEY_PEM, 'base64').toString('utf-8');
  const wwdrPem = Buffer.from(config.APPLE_WALLET_WWDR_PEM, 'base64').toString('utf-8');

  const pass = new PKPass(
    {},
    {
      signerCert: certPem,
      signerKey: keyPem,
      wwdr: wwdrPem,
      signerKeyPassphrase: config.APPLE_WALLET_KEY_PASSPHRASE,
    },
    {
      formatVersion: 1,
      passTypeIdentifier: config.APPLE_WALLET_PASS_TYPE_ID,
      serialNumber: card.cardId,
      teamIdentifier: config.APPLE_WALLET_TEAM_ID,
      organizationName: 'La Tête Dans Les Nuages',
      description: 'Ma Carte TDLN',
      foregroundColor: 'rgb(0, 211, 255)',
      backgroundColor: 'rgb(4, 13, 33)',
      labelColor: 'rgb(255, 255, 255)',
      storeCard: {
        primaryFields: [
          {
            key: 'balance',
            label: 'SOLDE',
            value: `${card.balance} unités`,
            textAlignment: 'PKTextAlignmentLeft',
          },
        ],
        secondaryFields: [
          {
            key: 'name',
            label: 'TITULAIRE',
            value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Membre',
          },
        ],
        auxiliaryFields: [
          {
            key: 'cardId',
            label: 'N° CARTE',
            value: card.cardId.slice(0, 8).toUpperCase(),
          },
        ],
        backFields: [
          {
            key: 'info',
            label: 'À propos',
            value: 'Cette carte vous permet de jouer dans nos salles. Présentez le QR code à la borne.',
          },
          {
            key: 'website',
            label: 'Site web',
            value: 'https://www.latetedanslesnuages.com',
          },
        ],
      },
    }
  );

  // QR code = cardId pour lecture aux bornes
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: card.cardId,
    messageEncoding: 'iso-8859-1',
    altText: card.cardId.slice(0, 8).toUpperCase(),
  });

  const buffer = await pass.getAsBuffer();
  return buffer;
}
