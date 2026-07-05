import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CameraCapture — handles camera stream, snapshot, preview, retake, and fallback.
 *
 * States:
 *  'loading'   — initializing camera
 *  'streaming' — live camera feed
 *  'preview'   — showing captured photo
 *  'error'     — camera denied/not found → file upload fallback
 *
 * Props:
 *  onCapture(imageBlob) — called when user confirms a photo
 *  disabled            — disables capture button (e.g., while uploading)
 */
export default function CameraCapture({ onCapture, disabled }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState]   = useState("loading"); // loading | streaming | preview | error
  const [capturedUrl, setCapturedUrl]   = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [errorMsg, setErrorMsg]         = useState("");

  // Start camera on mount
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraState("streaming");
      } catch (err) {
        if (cancelled) return;
        console.error("Camera error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMsg("Camera permission denied. Please allow camera access in your browser settings and refresh the page. 🙏");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMsg("No camera found on this device.");
        } else {
          setErrorMsg("Could not start camera. You can upload a photo instead.");
        }
        setCameraState("error");
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Take snapshot
  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    // Mirror horizontally (selfie convention)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCapturedUrl(url);
        setCapturedBlob(blob);
        setCameraState("preview");
        // Pause stream to save battery
        streamRef.current?.getTracks().forEach((t) => (t.enabled = false));
      },
      "image/jpeg",
      0.9
    );
  }, []);

  // Retake — resume stream
  const retake = useCallback(() => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
    streamRef.current?.getTracks().forEach((t) => (t.enabled = true));
    setCameraState("streaming");
  }, [capturedUrl]);

  // Submit captured photo
  const handleSubmit = useCallback(() => {
    if (capturedBlob) onCapture(capturedBlob);
  }, [capturedBlob, onCapture]);

  // File upload fallback
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedUrl(url);
    setCapturedBlob(file);
    setCameraState("preview");
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Camera / preview / error area */}
      <div
        className="relative w-full overflow-hidden rounded-3xl"
        style={{ background: "rgba(0,0,0,0.4)", minHeight: 260, maxHeight: 360 }}
      >
        {/* Loading spinner */}
        {cameraState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-selfie-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm font-semibold">Starting camera…</p>
          </div>
        )}

        {/* Live camera feed */}
        <video
          ref={videoRef}
          className="w-full object-cover rounded-3xl"
          style={{
            display: cameraState === "streaming" ? "block" : "none",
            transform: "scaleX(-1)", // mirror for selfie feel
            maxHeight: 360,
          }}
          playsInline
          muted
        />

        {/* Captured photo preview */}
        {cameraState === "preview" && capturedUrl && (
          <motion.img
            src={capturedUrl}
            alt="Your selfie"
            className="w-full object-cover rounded-3xl"
            style={{ maxHeight: 360 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Camera error + fallback */}
        {cameraState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="text-4xl">📷</span>
            <p className="text-white/70 text-sm font-semibold leading-relaxed">{errorMsg}</p>
            <label
              htmlFor="photo-upload"
              className="btn-secondary cursor-pointer text-sm px-5 py-3"
            >
              📁 Upload a Photo Instead
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Hidden canvas for snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Capture button overlay — only in streaming state */}
        {cameraState === "streaming" && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <motion.button
              id="capture-btn"
              type="button"
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-2xl select-none"
              style={{
                background: "linear-gradient(135deg, #ff1f7e, #8040ff)",
                boxShadow: "0 4px 24px rgba(255,31,126,0.5)",
              }}
              onClick={capturePhoto}
              whileTap={{ scale: 0.9 }}
              disabled={disabled}
              aria-label="Capture photo"
            >
              📸
            </motion.button>
          </div>
        )}
      </div>

      {/* Preview action buttons */}
      <AnimatePresence>
        {cameraState === "preview" && (
          <motion.div
            className="w-full flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <button
              id="retake-btn"
              type="button"
              className="btn-secondary flex-1 text-sm py-3"
              onClick={retake}
              disabled={disabled}
            >
              🔄 Retake
            </button>
            <motion.button
              id="submit-selfie-btn"
              type="button"
              className="btn-primary flex-[2] text-sm py-3"
              onClick={handleSubmit}
              disabled={disabled}
              whileTap={{ scale: 0.97 }}
            >
              {disabled ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                "✅ Looks Good, Submit!"
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
