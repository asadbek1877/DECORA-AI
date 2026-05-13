import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Component } from "@/components/ui/etheral-shadow";

const INTRO_EXIT_MS = 460;
let introCompletedThisPageLoad = false;

interface IntroScreenProps {
  onComplete?: () => void;
}

function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<"hidden" | "enter" | "exit">(() =>
    introCompletedThisPageLoad ? "hidden" : "enter",
  );
  const completedRef = useRef(false);
  const exitingRef = useRef(false);
  const previousOverflowRef = useRef("");

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;

    completedRef.current = true;
    introCompletedThisPageLoad = true;
    document.body.style.overflow = previousOverflowRef.current;
    setPhase("hidden");
    onComplete?.();
  }, [onComplete]);

  const handleStart = useCallback(() => {
    if (exitingRef.current || phase !== "enter") return;

    exitingRef.current = true;
    setPhase("exit");
    window.setTimeout(finishIntro, INTRO_EXIT_MS);
  }, [finishIntro, phase]);

  useEffect(() => {
    if (phase === "hidden") {
      finishIntro();
      return;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [finishIntro, phase]);

  if (phase === "hidden") return null;

  return (
    <div className={`intro-screen intro-screen--${phase}`} aria-label="PixelLift welcome screen">
      <Component
        className="intro-screen__shadow"
        color="rgba(115, 78, 255, 1)"
        sizing="fill"
        animation={{ scale: 45, speed: 35 }}
        noise={{ opacity: 0.35, scale: 1 }}
      />

      <div className="intro-screen__content">
        <p className="intro-screen__eyebrow">AI room redesign</p>
        <h1>PixelLift</h1>

        <div className="intro-screen__welcome">
          <p className="intro-screen__question">Are you ready for the future of design?</p>
          <button className="intro-screen__button" type="button" onClick={handleStart}>
            <span>Yes, let&apos;s go</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(IntroScreen);
