import { TrackElement, VideoElement } from "@twick/timeline";
import { useEffect, useState, useRef } from "react";
import { hasAudio } from "@twick/media-utils";
import { Loader2, VolumeX, Volume2, CheckCircle2, XCircle } from "lucide-react";
import {
  CaptionPhraseLength,
  ICaptionGenerationPollingResponse,
} from "../../types";

export function GenerateCaptionsPanel({
  selectedElement,
  addCaptionsToTimeline,
  onGenerateCaptions,
  getCaptionstatus,
  pollingIntervalMs = 5000,
}: {
  selectedElement: TrackElement;
  addCaptionsToTimeline: (
    captions: { s: number; e: number; t: string; w?: number[] }[]
  ) => void;
  onGenerateCaptions: (
    videoElement: VideoElement,
    language?: string,
    phraseLength?: CaptionPhraseLength,
  ) => Promise<string | null>;
  getCaptionstatus: (reqId: string) => Promise<ICaptionGenerationPollingResponse>;
  pollingIntervalMs?: number;
}) {
  const [containsAudio, setContainsAudio] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "polling" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [phraseLength, setPhraseLength] =
    useState<CaptionPhraseLength>("medium");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentReqIdRef = useRef<string | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = async (reqId: string) => {
    if (!getCaptionstatus) {
      return;
    }
    setPollingStatus("polling");
    setIsGenerating(true);
    setErrorMessage(null);

    const poll = async () => {
      try {
        const response = await getCaptionstatus(reqId);

        
        if (response.status === "completed") {
          stopPolling();
          setPollingStatus("success");
          setIsGenerating(false);
          
          // Add captions to timeline
          addCaptionsToTimeline(response.captions || []);
          
          // Reset status after 3 seconds
          setTimeout(() => {
            setPollingStatus("idle");
          }, 3000);
        } else if (response.status === "pending") {
          // Continue polling - interval will call this again
        } else if (response.status === "failed") {
          stopPolling();
          setPollingStatus("error");
          setIsGenerating(false);
          setErrorMessage(response.error || "Failed to generate captions");
          console.error("Error generating captions:", response.error);
        }
      } catch (error) {
        stopPolling();
        setPollingStatus("error");
        setIsGenerating(false);
        setErrorMessage(error instanceof Error ? error.message : "Failed to get caption status");
        console.error("Error polling for captions:", error);
      }
    };

    // Poll immediately, then at configured interval (default 5 seconds)
    await poll();
    pollingIntervalRef.current = setInterval(poll, pollingIntervalMs);
  };

  const handleGenerateCaptions = async () => {
    if (!(selectedElement instanceof VideoElement)) {
      return;
    }

    setIsGenerating(true);
    setPollingStatus("polling");
    const videoElement = selectedElement as VideoElement;
    

    try {
      const language =
        selectedLanguage === "auto" ? undefined : selectedLanguage;
      const reqId = await onGenerateCaptions(
        videoElement,
        language,
        phraseLength,
      );
      if (!reqId) {
        setPollingStatus("error");
        setIsGenerating(false);
        setErrorMessage("Failed to start caption generation");
        console.error("Error generating captions: Failed to start caption generation");
        return;
      }
      currentReqIdRef.current = reqId;
      await startPolling(reqId);
    } catch (error) {
      setPollingStatus("error");
      setIsGenerating(false);
      setErrorMessage(error instanceof Error ? error.message : "Failed to start caption generation");
      console.error("Error generating captions:", error);
    }
  };

  const checkAudio = async () => {
    setIsLoading(true);
    if (selectedElement instanceof VideoElement) {
      const videoElement = selectedElement as VideoElement;
      const videoUrl = videoElement.getSrc();
      if (videoUrl) {
        try {
          const hasAudioTrack = await hasAudio(videoUrl);
          setContainsAudio(hasAudioTrack);
        } catch (error) {
          console.error("Error checking audio:", error);
          setContainsAudio(false);
        }
      } else {
        setContainsAudio(false);
      }
    } else {
      setContainsAudio(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAudio();
    // Reset polling state when element changes
    stopPolling();
    setPollingStatus("idle");
    setIsGenerating(false);
    setErrorMessage(null);
  }, [selectedElement]);

  return (
    <div className="panel-container">
      <div className="panel-title">生成字幕</div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <Loader2 className="empty-state-icon animate-spin" />
              <p className="empty-state-text">检测音频中...</p>
            </div>
          </div>
        </div>
      )}

      {/* No Audio State */}
      {!isLoading && containsAudio === false && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <VolumeX className="empty-state-icon" />
              <p className="empty-state-text">该视频未检测到音频轨道</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Present State */}
      {!isLoading && containsAudio === true && pollingStatus === "idle" && !isGenerating && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <Volume2 className="empty-state-icon" />
              <p className="empty-state-text">已检测到音频，可以生成字幕</p>
            </div>
          </div>
        </div>
      )}

      {/* Language selection */}
      {!isLoading && containsAudio === true && (
        <div className="panel-section">
          <label className="label-dark" htmlFor="caption-language">
            音频语言
          </label>
          <select
            id="caption-language"
            className="select-dark"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="auto">自动检测</option>
            <option value="english">英语</option>
            <option value="italian">意大利语</option>
            <option value="spanish">西班牙语</option>
            <option value="portuguese">葡萄牙语</option>
            <option value="french">法语</option>
            <option value="german">德语</option>
            <option value="turkish">土耳其语</option>
            <option value="indonesian">印尼语</option>
            <option value="hindi">印地语</option>
          </select>
        </div>
      )}
      {/* Caption length selection */}
      {!isLoading && containsAudio === true && (
        <div className="panel-section">
          <label className="label-dark" htmlFor="caption-phrase-length">
            字幕长度
          </label>
          <select
            id="caption-phrase-length"
            className="select-dark"
            value={phraseLength}
            onChange={(e) =>
              setPhraseLength(e.target.value as CaptionPhraseLength)
            }
          >
            <option value="short">短</option>
            <option value="medium">中</option>
            <option value="long">长</option>
          </select>
        </div>
      )}

      {/* Polling/Generating State */}
      {!isLoading && isGenerating && pollingStatus === "polling" && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <Loader2 className="empty-state-icon animate-spin" />
              <p className="empty-state-text">正在生成字幕，请稍候...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!isLoading && pollingStatus === "success" && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <CheckCircle2 className="empty-state-icon" color="var(--color-green-500)" />
              <p className="empty-state-text">字幕生成成功！</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && pollingStatus === "error" && (
        <div className="panel-section">
          <div className="empty-state">
            <div className="empty-state-content">
              <XCircle className="empty-state-icon" color="var(--color-red-500)" />
              <p className="empty-state-text">{errorMessage || "字幕生成失败"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!isLoading && (
        <div className="flex panel-section">
          <button
            onClick={handleGenerateCaptions}
            disabled={!containsAudio || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? "生成中..." : "生成字幕"}
          </button>
        </div>
      )}
    </div>
  );
}
