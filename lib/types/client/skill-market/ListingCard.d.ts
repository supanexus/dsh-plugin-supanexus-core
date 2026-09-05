import type { PluginListingItem } from '../../shared/plugin-market-contract.ts';
import type { SkillMarketState } from './useSkillMarket.ts';
import type { SkillMarketLayout } from './layout.ts';
export interface ListingCardProps {
    readonly item: PluginListingItem;
    readonly state: SkillMarketState;
    readonly layout: SkillMarketLayout;
}
export declare function ListingCard({ item, state, layout }: ListingCardProps): import("react").JSX.Element;
//# sourceMappingURL=ListingCard.d.ts.map