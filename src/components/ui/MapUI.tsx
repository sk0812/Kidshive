export function Map() {
  return (
    <div className="aspect-video rounded-lg overflow-hidden">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d79313.83202140601!2d-0.48879674871686424!3d51.594677428091025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48766b51d980f5b5%3A0xa346a1e910c1d8e3!2sKidshive!5e0!3m2!1sen!2suk!4v1733410442908!5m2!1sen!2suk"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
