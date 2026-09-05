import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client';
type SupaNexusBrandMarkProps = HeroBrandMarkOwnerProps & SidebarBrandMarkOwnerProps;
export interface SupaNexusBrandNameProps {
    readonly locale: string | undefined;
}
/**
 * Render the SupaNexus mark with the presentation requested by its host surface.
 * @param props - Host-supplied mark presentation.
 * @returns the SupaNexus logo mark.
 */
export declare function SupaNexusBrandMark({ size, className }: SupaNexusBrandMarkProps): import("react").JSX.Element;
/**
 * Render the SupaNexus wordmark and console subtitle without its slotted mark.
 * @returns the SupaNexus brand name stack.
 */
export declare function SupaNexusBrandName({ locale }: SupaNexusBrandNameProps): import("react").JSX.Element;
export declare function SupaNexusBrandNameSlot({ ctx }: {
    readonly ctx: ClientContext;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=Brand.d.ts.map