"use client";
import { Stage } from "@/lib/oaScript";

export default function JointStageSvg({ stage }: { stage: Stage }) {
  return (
    <svg width="380" height="460" viewBox="0 0 380 460" xmlns="http://www.w3.org/2000/svg">
      <rect width="380" height="460" fill="#0B1F3A" />
      <path d="M110 40 C70 40 55 90 55 140 C55 180 75 205 110 215 L190 215 C210 205 215 190 215 170 C215 120 200 40 150 40 Z" fill="#E8D9BC" stroke="#B8A276" strokeWidth="1" />
      <path d="M110 215 C90 210 78 200 72 185 L72 180 C90 195 110 200 130 198 L190 200 C205 195 212 185 213 172 L213 170 C210 190 205 205 190 213 Z" fill="#DCEEF2" stroke="#8FC4D1" strokeWidth="1" opacity={stage.cart} />
      <path d="M100 420 C70 420 58 370 60 320 C62 280 78 250 110 245 L185 245 C205 250 218 275 218 310 C218 355 205 410 165 420 Z" fill="#E8D9BC" stroke="#B8A276" strokeWidth="1" />
      <path d="M110 245 C90 248 78 258 72 272 L72 278 C90 265 110 260 130 261 L185 262 C202 265 210 275 213 285 L213 280 C210 265 202 253 188 246 Z" fill="#DCEEF2" stroke="#8FC4D1" strokeWidth="1" opacity={stage.cart} />
      <rect x="75" y="218" width="140" height="26" fill="#0B1F3A" />
      <text x="145" y="234" textAnchor="middle" fontSize="12" fill="#9AA6B8">
        {stage.cart < 0.3 ? "bone-on-bone" : "synovial fluid"}
      </text>
      <path d="M50 60 C25 90 20 200 25 260 C30 320 45 390 90 425" fill="none" stroke="#E8A0B0" strokeWidth="2" />
      <path d="M235 55 C255 100 250 190 245 250 C240 310 220 385 185 418" fill="none" stroke="#C9A876" strokeWidth="3" strokeLinecap="round" />
      <g opacity={stage.osteo}>
        <path d="M60 200 C48 205 44 215 50 222 C58 226 68 220 68 210 Z" fill="#D8C299" stroke="#B8A276" strokeWidth="1" />
        <path d="M220 200 C232 205 236 215 230 222 C222 226 212 220 212 210 Z" fill="#D8C299" stroke="#B8A276" strokeWidth="1" />
      </g>
      <ellipse cx="150" cy="230" rx="14" ry="10" fill="#F0E6D2" stroke="#B8A276" strokeWidth="1" opacity={stage.cyst} />
      <path d="M100 200 C110 208 175 208 195 198" fill="none" stroke="#8F7A4A" strokeWidth="4" strokeLinecap="round" opacity={stage.scler} />
      <path d="M100 258 C110 253 175 253 195 260" fill="none" stroke="#8F7A4A" strokeWidth="4" strokeLinecap="round" opacity={stage.scler} />
      <g opacity={stage.crack} stroke="#7A9FA8" strokeWidth="1" fill="none">
        <path d="M95 200 l6 8 M120 197 l5 9 M150 197 l4 9 M180 199 l5 8" />
        <path d="M95 260 l6 -8 M120 262 l5 -9 M150 262 l4 -9 M180 260 l5 -8" />
      </g>
    </svg>
  );
}
