import type { SkillMarketState } from './useSkillMarket.ts';
export interface SkillMarketPanelProps {
    readonly state: SkillMarketState;
    readonly onClose: () => void;
    /** Resolved SupaNexus official site (.ai / .io + locale). */
    readonly officialSiteUrl: string;
}
export declare function SkillMarketPanel({ state, onClose, officialSiteUrl }: SkillMarketPanelProps): import("react").JSX.Element;
//# sourceMappingURL=SkillMarketPanel.d.ts.map