import { LegalPage, LegalSection } from '../components/LegalPage';
import { usePageMeta } from '../hooks/usePageMeta';

export function Cgu() {
  usePageMeta({
    title: "Conditions générales d'utilisation",
    description:
      "Les conditions générales d'utilisation du site BureauStore : accès, comptes, commandes et responsabilités.",
    path: '/cgu',
  });

  return (
    <LegalPage title="Conditions générales d'utilisation" updatedAt="22 septembre 2026">
      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions générales d'utilisation (CGU) encadrent l'accès et l'utilisation
          du site <strong>www.bureaustore.fr</strong> édité par BureauStore. En naviguant sur le
          site ou en créant un compte, vous acceptez les présentes CGU.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au site">
        <p>
          Le site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet.
          BureauStore se réserve le droit de suspendre l'accès au site pour maintenance ou toute
          autre raison, sans préavis.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte utilisateur">
        <ul className="list-disc space-y-1 pl-5">
          <li>La création d'un compte nécessite des informations exactes et à jour ;</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants ;</li>
          <li>Toute utilisation frauduleuse du compte doit être signalée immédiatement ;</li>
          <li>BureauStore peut suspendre un compte en cas de manquement aux présentes CGU.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Commandes et prix">
        <p>
          Les prix affichés sont en euros, toutes taxes comprises. BureauStore se réserve le droit
          de modifier ses prix à tout moment, les produits étant facturés au tarif en vigueur au
          moment de la commande. La commande n'est définitive qu'après confirmation du paiement.
        </p>
      </LegalSection>

      <LegalSection title="5. Propriété intellectuelle">
        <p>
          L'ensemble des contenus du site (textes, images, logos, marques, structure) est protégé
          par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans
          autorisation écrite préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilité">
        <p>
          BureauStore s'efforce d'assurer l'exactitude des informations publiées mais ne peut
          garantir l'absence d'erreurs. La responsabilité de BureauStore ne saurait être engagée en
          cas de dommage indirect résultant de l'utilisation du site.
        </p>
      </LegalSection>

      <LegalSection title="7. Liens hypertextes">
        <p>
          Le site peut contenir des liens vers des sites tiers. BureauStore n'exerce aucun contrôle
          sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>
      </LegalSection>

      <LegalSection title="8. Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de
          résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </LegalSection>
    </LegalPage>
  );
}