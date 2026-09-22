import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 32,
              padding: 24,
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </div>
          <div style={{ display: 'flex', color: 'white', fontSize: 96, fontWeight: 900, letterSpacing: -2 }}>
            MediGo
          </div>
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.9)', fontSize: 36, fontWeight: 600 }}>
          Votre santé au Togo, en temps réel
        </div>
      </div>
    ),
    { ...size }
  );
}
