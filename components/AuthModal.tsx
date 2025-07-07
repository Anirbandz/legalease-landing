"use client";
import { useState } from "react";
import Auth from "./Auth";

export default function AuthModal({ open, onClose, onAuthSuccess }: { open: boolean; onClose: () => void; onAuthSuccess?: () => void }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
        <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Sign In / Sign Up</h2>
        <Auth onAuthSuccess={onAuthSuccess} />
      </div>
    </div>
  );
} 