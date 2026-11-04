"use client";

import React from "react";
import { css } from "@emotion/react";
import useProposalAudioSummary from "@/hooks/proposal-audio-summary";

const SPEEDS = [1, 1.25, 1.5, 2];

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

const ProposalAudioSummary = ({ proposalId }) => {
  const { data } = useProposalAudioSummary(proposalId);
  const audioRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);

  const audioUrl = data?.audioUrl;

  if (audioUrl == null) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio == null) return;
    if (isPlaying) audio.pause();
    else {
      audio.playbackRate = speed;
      audio.play();
    }
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current != null) audioRef.current.playbackRate = next;
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (audio == null || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(e.target.value) / 1000) * audio.duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 1000 : 0;

  return (
    <div
      css={(t) =>
        css({
          margin: "1.6rem 0",
          padding: "1.2rem 1.4rem",
          borderRadius: "0.8rem",
          background: t.colors.backgroundModifierNormal,
          border: `0.1rem solid ${t.colors.borderLighter}`,
        })
      }
    >
      <div
        css={(t) =>
          css({
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "0.8rem",
            fontSize: t.text.sizes.small,
            color: t.colors.textDimmed,
          })
        }
      >
        <span
          css={(t) =>
            css({
              fontWeight: t.text.weights.emphasis,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            })
          }
        >
          Summary in audio
        </span>
        {data.newsUrl != null && (
          <a
            href={data.newsUrl}
            target="_blank"
            rel="noreferrer"
            css={(t) =>
              css({
                color: t.colors.textDimmed,
                textDecoration: "none",
                whiteSpace: "nowrap",
                "@media(hover: hover)": {
                  ":hover": { color: t.colors.textNormal },
                },
              })
            }
          >
            by Nouns TV News {"↗"}
          </a>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      />

      <div css={css({ display: "flex", alignItems: "center", gap: "1.2rem" })}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause summary" : "Play summary"}
          css={(t) =>
            css({
              flexShrink: 0,
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              border: 0,
              background: t.colors.primary,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.15s transform ease-out",
              "@media(hover: hover)": {
                cursor: "pointer",
                ":hover": { transform: "scale(1.06)" },
              },
              ":focus-visible": { boxShadow: t.shadows.focus, outline: "none" },
              svg: { width: "2rem", height: "2rem", display: "block" },
            })
          }
        >
          {isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon style={{ transform: "translateX(0.1rem)" }} />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1000"
          value={Math.round(progress)}
          onChange={seek}
          aria-label="Summary progress"
          css={(t) =>
            css({
              flex: 1,
              minWidth: 0,
              accentColor: t.colors.primary,
              cursor: "pointer",
            })
          }
        />

        <span
          css={(t) =>
            css({
              fontSize: t.text.sizes.small,
              color: t.colors.textDimmed,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            })
          }
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${speed}x`}
          css={(t) =>
            css({
              flexShrink: 0,
              border: `0.1rem solid ${t.colors.borderLight}`,
              background: "transparent",
              color: t.colors.textNormal,
              borderRadius: "0.4rem",
              padding: "0.2rem 0.6rem",
              fontSize: t.text.sizes.small,
              fontVariantNumeric: "tabular-nums",
              "@media(hover: hover)": {
                cursor: "pointer",
                ":hover": { background: t.colors.backgroundModifierNormal },
              },
            })
          }
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};

export default ProposalAudioSummary;
