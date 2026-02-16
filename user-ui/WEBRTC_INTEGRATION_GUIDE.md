# User UI - WebRTC Video Consultation Integration Guide

This document provides step-by-step instructions to integrate WebRTC video consultation into the User UI, allowing patients to join telemedicine sessions with their doctors.

---

## Prerequisites

1. **Backend Signaling Server** must be running with the `SignalingModule` enabled (already implemented).
2. **Doctor UI** WebRTC integration must be complete (already implemented).

---

## Step 1: Install Dependencies

```bash
cd user-ui
npm install socket.io-client
```

---

## Step 2: Create the `useWebRTC` Hook

Create file: `src/hooks/useWebRTC.ts`

Copy the hook from `doctor-ui/src/hooks/useWebRTC.ts` with the following modification:
- Change the default `role` parameter to `'patient'` instead of `'doctor'`
- The patient **receives** offers and **sends** answers (this is already handled in the hook logic)

```typescript
// The hook is the same as doctor-ui, just pass role: 'patient' when using it
```

---

## Step 3: Create the `VideoCall` Component

Create file: `src/components/VideoCall.tsx`

Copy the component from `doctor-ui/src/components/VideoCall.tsx`.

The component is reusable and works for both doctor and patient. You may customize:
- Replace `patientName` prop with `doctorName` for display purposes
- Adjust UI styling to match user-ui design system

---

## Step 4: Create the `ConsultationPage`

Create file: `src/pages/ConsultationPage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VideoCall } from '../components/VideoCall';
import { useWebRTC } from '../hooks/useWebRTC';
import { PageTransition } from '../components/PageTransition';

const SIGNALING_SERVER = import.meta.env.VITE_API_URL || 'http://localhost:7070';

export function ConsultationPage() {
  const { t } = useTranslation();
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const [callStarted, setCallStarted] = useState(false);

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    connectionQuality,
    isMuted,
    isVideoEnabled,
    peerVideoEnabled,
    toggleMute,
    toggleVideo,
    endCall,
    startCall,
  } = useWebRTC({
    serverUrl: SIGNALING_SERVER,
    roomId: consultationId || '',
    role: 'patient', // <-- Patient role
  });

  useEffect(() => {
    if (consultationId && !callStarted) {
      setCallStarted(true);
      startCall().catch(err => {
        console.error('Failed to start call:', err);
      });
    }
  }, [consultationId, callStarted, startCall]);

  const handleEndCall = () => {
    endCall();
    navigate('/profile'); // Navigate back to profile or appointments
  };

  if (!consultationId) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-cream-50">
          <div className="text-center">
            <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
              {t('consultation.noActiveSession', 'No Active Session')}
            </h2>
            <p className="text-stone-500 mb-4">
              {t('consultation.waitForDoctor', 'Please wait for your doctor to start the consultation.')}
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="p-4 bg-black/80 text-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{t('consultation.title', 'Consultation')}</h1>
            <p className="text-sm text-white/60">
              {isConnected ? t('consultation.connected', 'Connected') : t('consultation.connecting', 'Connecting...')}
            </p>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1">
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            isConnected={isConnected}
            isConnecting={isConnecting}
            connectionQuality={connectionQuality}
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
            peerVideoEnabled={peerVideoEnabled}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onEndCall={handleEndCall}
            patientName={t('consultation.doctor', 'Doctor')} // Shows "Doctor" in place of patient
          />
        </div>
      </div>
    </PageTransition>
  );
}
```

---

## Step 5: Add Route in `App.tsx`

Add the route for the consultation page:

```tsx
import { ConsultationPage } from './pages/ConsultationPage';

// Inside Routes:
<Route path="/consultation/:consultationId" element={<ConsultationPage />} />
```

---

## Step 6: Add i18n Translations

Add to `src/i18n/locales/en.json`:

```json
"consultation": {
  "title": "Video Consultation",
  "connected": "Connected to your doctor",
  "connecting": "Connecting...",
  "noActiveSession": "No Active Session",
  "waitForDoctor": "Please wait for your doctor to start the consultation.",
  "doctor": "Doctor",
  "endCall": "End Call",
  "mute": "Mute",
  "unmute": "Unmute",
  "enableVideo": "Enable Video",
  "disableVideo": "Disable Video",
  "quality": {
    "excellent": "Excellent",
    "good": "Good",
    "fair": "Fair",
    "poor": "Poor",
    "audioOnly": "Audio Only"
  }
}
```

Add to `src/i18n/locales/fr.json`:

```json
"consultation": {
  "title": "Consultation Vidéo",
  "connected": "Connecté à votre médecin",
  "connecting": "Connexion en cours...",
  "noActiveSession": "Aucune session active",
  "waitForDoctor": "Veuillez attendre que votre médecin démarre la consultation.",
  "doctor": "Médecin",
  "endCall": "Terminer l'appel",
  "mute": "Couper le micro",
  "unmute": "Activer le micro",
  "enableVideo": "Activer la vidéo",
  "disableVideo": "Désactiver la vidéo",
  "quality": {
    "excellent": "Excellente",
    "good": "Bonne",
    "fair": "Moyenne",
    "poor": "Faible",
    "audioOnly": "Audio uniquement"
  }
}
```

---

## Step 7: Entry Point for Patients

Patients need a way to join consultations. Options:

### Option A: Push Notification
When doctor starts a consultation, send a push notification to the patient with a deep link:
```
/consultation/{consultationId}
```

### Option B: Appointments List
In the patient's profile or appointments section, show a "Join Consultation" button for scheduled appointments that are active:

```tsx
{appointment.status === 'active' && (
  <Link 
    to={`/consultation/${appointment.id}`}
    className="px-4 py-2 bg-green-500 text-white rounded-lg"
  >
    Join Video Call
  </Link>
)}
```

### Option C: Waiting Room
Create a waiting room page where patients can go before their scheduled appointment time. The page auto-connects when the doctor joins.

---

## Step 8: Environment Variable

Ensure `VITE_API_URL` is set in `.env`:

```env
VITE_API_URL=http://localhost:7070
```

For production:
```env
VITE_API_URL=https://api.mydermalife.com
```

---

## How It Works

1. **Doctor** navigates to `/telemedicine/{consultationId}` from the Agenda
2. **Patient** navigates to `/consultation/{consultationId}` (from notification, link, or appointments)
3. Both connect to the same Socket.IO room (`consultationId`)
4. **Doctor** creates WebRTC offer, patient receives and sends answer
5. ICE candidates are exchanged via the signaling server
6. **P2P connection established** - video/audio streams directly between browsers

---

## Testing Locally

1. Open Doctor UI in Chrome: `http://localhost:5173/telemedicine/test-room`
2. Open User UI in another browser/incognito: `http://localhost:5174/consultation/test-room`
3. Both should request camera/mic permissions
4. Video should appear on both sides when connected

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera/mic not working | Check browser permissions, ensure HTTPS in production |
| Connection fails | Verify signaling server is running, check CORS settings |
| No video/audio | Check if tracks are properly added to peer connection |
| One-way audio/video | Might be NAT issue, need TURN server for production |

---

## Production Considerations

> ⚠️ **TURN Server Required**
> 
> For production, you MUST configure a TURN server for reliable NAT traversal.
> Options: Coturn (self-hosted), Twilio, Xirsys
>
> Update `useWebRTC.ts` ICE servers configuration:
> ```typescript
> const ICE_SERVERS: RTCConfiguration = {
>   iceServers: [
>     { urls: 'stun:stun.l.google.com:19302' },
>     { 
>       urls: 'turn:your-turn-server.com:3478',
>       username: 'username',
>       credential: 'password'
>     }
>   ],
> };
> ```
