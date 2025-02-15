import type { FileStatusDto, FileStatusStep } from "~/types/file.types";

export const useFileStatus = () => {
    const processingSteps = ref<FileStatusStep[]>([
        { status: "queued", label: "File in queue for processing" },
        { status: "processing", label: "Reading file, extracting metadata, and creating embeddings" },
        { status: "completed", label: "File processed successfully" },
    ]);

    const getCurrentStep = (status: FileStatusDto[]) => {
        return status[status.length - 1].step;
    }

    const getStepClass = (step: FileStatusStep, status: FileStatusDto[], isCard = true) => {
        const stepInStatus = status.find(s => s.step === step.status);
        const styles = {
            default: isCard ? 'bg-slate-700' : 'bg-slate-800',
            failed: isCard ? 'bg-red-500' : 'bg-red-500/20',
            completed: isCard ? 'bg-emerald-500' : 'bg-emerald-500/20',
            active: isCard ? 'bg-yellow-400 animate-pulse-subtle' : 'bg-yellow-500/20'
        };

        if (!stepInStatus) return styles.default;
        if (stepInStatus.failed) return styles.failed;
        if (stepInStatus.completedAt) return styles.completed;
        if (stepInStatus.startedAt) return styles.active;
    };


    const getCardStepClass = (step: FileStatusStep, status: FileStatusDto[]) =>
        getStepClass(step, status, true);

    const getDetailStepClass = (step: FileStatusStep, status: FileStatusDto[]) =>
        getStepClass(step, status, false);

    const getCurrentStepLabel = (status: FileStatusDto[]) => {
        const currentStep = getCurrentStep(status);

        if (currentStep === "failed") {
            return "Failed to process file";
        }

        return processingSteps.value.find(step => step.status === currentStep)?.label;
    };

    return {
        processingSteps,
        getCurrentStep,
        getCardStepClass,
        getDetailStepClass,
        getCurrentStepLabel,
    };
};