
import "./BrandDNAIcon.css";

export default function BrandDNAIcon() {
  return (
    <div className="brand-dna" aria-label="Brand identity">
      <svg viewBox="0 0 180 180" fill="none" role="img">
        <defs>
          <linearGradient id="dna-core" x1="25" y1="20" x2="150" y2="160">
            <stop stopColor="#A7F2D7" />
            <stop offset=".45" stopColor="#3E9975" />
            <stop offset="1" stopColor="#183D30" />
          </linearGradient>
          <linearGradient id="dna-gold" x1="0" y1="0" x2="180" y2="180">
            <stop stopColor="#F1DBA6" />
            <stop offset="1" stopColor="#A9854E" />
          </linearGradient>
          <filter id="dna-shadow">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <ellipse cx="90" cy="151" rx="45" ry="9"
          fill="#183D30" opacity=".12" filter="url(#dna-shadow)" />

        <g className="dna-orbits">
          <ellipse cx="90" cy="86" rx="73" ry="29"
            stroke="url(#dna-gold)" strokeWidth="2"
            transform="rotate(-35 90 86)" />
          <ellipse cx="90" cy="86" rx="73" ry="29"
            stroke="#5FAF91" strokeWidth="1.8"
            transform="rotate(48 90 86)" />
          <ellipse cx="90" cy="86" rx="64" ry="64"
            stroke="#C7A76C" strokeWidth="1"
            strokeDasharray="3 8" opacity=".6" />
        </g>

        <g className="dna-crystal">
          <path d="M90 35 132 63 126 111 90 140 54 111 48 63Z"
            fill="url(#dna-core)" stroke="#C7A76C" strokeWidth="1.5" />
          <path d="M90 35V140M48 63 90 87 132 63M54 111 90 87 126 111"
            stroke="#D3FFE9" strokeWidth="1" opacity=".65" />
          <path d="M90 35 48 63 90 87Z" fill="#D2FFE8" opacity=".35" />
          <path d="M90 87 126 111 90 140Z" fill="#082C20" opacity=".3" />
        </g>

        <circle className="dna-node dna-node-one"
          cx="30" cy="70" r="5" fill="#C7A76C" />
        <circle className="dna-node dna-node-two"
          cx="145" cy="58" r="5" fill="#69DCC2" />
        <circle className="dna-node dna-node-three"
          cx="145" cy="125" r="5" fill="#C7A76C" />
      </svg>
    </div>
  );
}
