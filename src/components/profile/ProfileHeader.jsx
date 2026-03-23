export default function ProfileHeader({ fullName, headline, openSectionModal }) {
  return (
    <section className="hx-profile-topbar">
      <div className="hx-profile-hero-copy">
        <h1 className="hx-profile-v2-name">{fullName}</h1>
        <p className="hx-headline">
          {headline?.trim() ? headline : "Agrega un titular profesional"}
        </p>
      </div>
    </section>
  );
}