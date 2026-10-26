/** Drapeau officiel des Comores (tracé de Wikimedia Commons, domaine public), proportions 3:5. */
export function ComorosFlag({ className = "h-7 w-auto" }: { className?: string }) {
  const star = "m12.519 10.75 1.029 3.166-2.693-1.957h3.329l-2.693 1.957z";
  return (
    <svg viewBox="0 0 60 36" className={className} role="img" aria-label="Drapeau des Comores">
      <path d="M0 0h60v36H0z" fill="#fff" />
      <path d="M0 0h60v9H0z" fill="#ffd100" />
      <path d="M0 18h60v18H0z" fill="#ef3340" />
      <path d="M0 27h60v9H0z" fill="#003da5" />
      <path d="M30 18 0 36V0z" fill="#009639" />
      <g fill="#fff">
        <path d="M12.519 9.809a8.25 8.25 0 0 0 0 16.382 8.5 8.5 0 1 1 0-16.382z" />
        {[0, 3.75, 7.5, 11.25].map((y) => (
          <path key={y} d={star} transform={`translate(0 ${y})`} />
        ))}
      </g>
    </svg>
  );
}
