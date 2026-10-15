import { LegalPage, LegalSection } from '../components/LegalPage';
import { usePageMeta } from '../hooks/usePageMeta';

export function Confidentialite() {
  usePageMeta({
    title: 'Politique de confidentialité',
    description:
      'Découvrez comment BureauStore collecte, utilise et protège vos données personnelles conformément au RGPD.',
    path: '/confidentialite',
  });

  return (
    <LegalPage title="Politique de confidentialité" updatedAt="22 septembre 2026">
      <LegalSection title="1. Responsable du traitement">
        <p>
          BureauStore (ci-après « nous ») est responsable du traitement des données personnelles
          collectées sur le site <strong>www.bureaustore.fr</strong>. Pour toute question relative à
          vos données, contactez-nous à l'adresse : <strong>contact@bureaustore.fr</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Données d'identification : nom, prénom, adresse email, téléphone ;</li>
          <li>Données de livraison et de facturation : adresse postale ;</li>
          <li>Données de commande : historique d'achats, panier ;</li>
          <li>Données de connexion : identifiant et mot de passe (chiffré) ;</li>
          <li>Données de navigation : cookies, pages visitées (avec votre consentement).</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités du traitement">
        <ul className="list-disc space-y-1 pl-5">
          <li>Gestion des comptes clients et de l'authentification ;</li>
          <li>Traitement et suivi des commandes ;</li>
          <li>Gestion de la livraison et du service après-vente ;</li>
          <li>Envoi de la newsletter (avec consentement) ;</li>
          <li>Amélioration du site et mesure d'audience (avec consentement).</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base légale">
        <p>
          Les traitements reposent sur l'exécution du contrat (commandes), le consentement
          (newsletter, cookies), nos obligations légales (facturation) et notre intérêt légitime
          (sécurité, amélioration du service).
        </p>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <ul className="list-disc space-y-1 pl-5">
          <li>Comptes clients : 3 ans après la dernière activité ;</li>
          <li>Données de commande : 10 ans (obligation comptable) ;</li>
          <li>Cookies : 13 mois maximum.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Destinataires des données">
        <p>
          Vos données sont transmises uniquement aux prestataires nécessaires au service :
          transporteurs, prestataire de paiement, hébergeur. Elles ne sont jamais vendues à des
          tiers.
        </p>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <p>
          Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement,
          de limitation, d'opposition et de portabilité de vos données. Vous pouvez les exercer en
          écrivant à <strong>contact@bureaustore.fr</strong>. Vous pouvez également introduire une
          réclamation auprès de la CNIL.
        </p>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>
          Les données sont hébergées sur des serveurs sécurisés. Les mots de passe sont chiffrés
          (bcrypt) et les échanges sont protégés par le protocole HTTPS.
        </p>
      </LegalSection>
    </LegalPage>
  );
}