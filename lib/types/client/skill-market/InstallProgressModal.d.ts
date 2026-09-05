import type { SkillMarketState } from './useSkillMarket.ts';
import type { InstallProgressState } from './install-progress.ts';
export interface InstallProgressModalProps {
    readonly progress: InstallProgressState;
    readonly t: SkillMarketState['t'];
    readonly onClose: () => void;
    readonly onStartInstall: () => void;
    readonly onStartUpgrade: () => void;
    readonly onStartUninstall: () => void;
    readonly onToggleLog: () => void;
}
export declare function InstallProgressModal({ progress, t, onClose, onStartInstall, onStartUpgrade, onStartUninstall, onToggleLog, }: InstallProgressModalProps): import("react").JSX.Element;
//# sourceMappingURL=InstallProgressModal.d.ts.map