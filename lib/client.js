window.__ModuleLoader__.load({
	id: "@supanexus/dsh-plugin-supanexus-core",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/types/shared/settings-contract.js
		/** Settings namespace shared by Host registration and Client cards. */
		const SUPANEXUS_SETTINGS_NS = "supanexus";
		/** Field that controls sidebar balance visibility. */
		const SHOW_WALLET_FIELD = "showWallet";
		/** Field that controls SupaNexus brand chrome (sidebar + hero + tab). */
		const SHOW_BRAND_FIELD = "showBrand";
		/** Field that pins the platform region (`global` | `cn`). */
		const PINNED_LINE_FIELD = "pinnedLine";
		//#endregion
		//#region lib/types/client/settings/useShowWalletPref.js
		/** Subscribe to boolean preferences from the bound settings scope. */
		/** Effective showWallet (defaults to false while loading / missing). */
		function readShowWallet(scope) {
			return scope.getSnapshot().value?.showWallet ?? false;
		}
		/** Effective showBrand (defaults to true while loading / missing). */
		function readShowBrand(scope) {
			return scope.getSnapshot().value?.showBrand ?? true;
		}
		/** Active line id for .ai / .io site pick (`pinnedLine` → `resolvedLine` → `global`). */
		function readActiveLineId(scope) {
			const value = scope.getSnapshot().value;
			const pinned = value?.pinnedLine?.trim();
			if (pinned !== void 0 && pinned.length > 0) return pinned;
			const resolved = value?.resolvedLine?.trim();
			if (resolved !== void 0 && resolved.length > 0) return resolved;
			return "global";
		}
		/** React mirror of {@link readShowWallet}. */
		function useShowWalletPref(scope) {
			const [showWallet, setShowWallet] = (0, react.useState)(() => readShowWallet(scope));
			(0, react.useEffect)(() => scope.subscribe(() => {
				setShowWallet(readShowWallet(scope));
			}), [scope]);
			return showWallet;
		}
		/** React mirror of {@link readShowBrand}. */
		function useShowBrandPref(scope) {
			const [showBrand, setShowBrand] = (0, react.useState)(() => readShowBrand(scope));
			(0, react.useEffect)(() => scope.subscribe(() => {
				setShowBrand(readShowBrand(scope));
			}), [scope]);
			return showBrand;
		}
		/** React mirror of {@link readActiveLineId}. */
		function useActiveLineId(scope) {
			const [lineId, setLineId] = (0, react.useState)(() => readActiveLineId(scope));
			(0, react.useEffect)(() => scope.subscribe(() => {
				setLineId(readActiveLineId(scope));
			}), [scope]);
			return lineId;
		}
		/** Whether the namespace is ready and accepts writes. */
		function useSettingsWritable(scope) {
			const [state, setState] = (0, react.useState)(() => {
				const snap = scope.getSnapshot();
				return {
					available: snap.status === "ready",
					writable: snap.writable
				};
			});
			(0, react.useEffect)(() => scope.subscribe(() => {
				const snap = scope.getSnapshot();
				setState({
					available: snap.status === "ready",
					writable: snap.writable
				});
			}), [scope]);
			return state;
		}
		//#endregion
		//#region lib/types/client/use-client-locale.js
		/** Subscribe to DSH active locale for reactive client copy. */
		function useClientLocale(ctx) {
			const [locale, setLocale] = (0, react.useState)(() => ctx.locale.getSnapshot().active);
			(0, react.useEffect)(() => ctx.locale.subscribe(() => {
				setLocale(ctx.locale.getSnapshot().active);
			}), [ctx]);
			return locale;
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/brand/brand.module.css.mjs
		const css$5 = ".kqjh6q_brandNameStack{flex-direction:column;justify-content:center;align-items:flex-start;gap:0;width:100%;min-width:0;height:24px;display:inline-flex;overflow:hidden}.kqjh6q_wordmark{letter-spacing:.04em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;color:#1212f9;min-width:0;max-width:100%;padding-bottom:2px;font-size:11px;font-weight:800;line-height:12px;display:block;position:relative;overflow:hidden}.kqjh6q_wordmark:after{content:\"\";opacity:.45;background:linear-gradient(90deg,#1212f9 0%,#3b3bff 55%,#0000 100%);border-radius:999px;height:1.5px;position:absolute;bottom:0;left:0;right:0}.kqjh6q_subtitle{text-overflow:ellipsis;white-space:nowrap;opacity:.65;min-width:0;max-width:100%;font-size:10px;font-weight:500;line-height:11px;display:block;overflow:hidden}";
		const tagId$5 = "@supanexus/dsh-plugin-supanexus-core/brand.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var brand_module_css_default = {
			"brandNameStack": "kqjh6q_brandNameStack",
			"subtitle": "kqjh6q_subtitle",
			"wordmark": "kqjh6q_wordmark"
		};
		//#endregion
		//#region lib/types/client/brand/locales.js
		/** Brand copy keys. */
		const brandMessages = {
			"zh-CN": { subtitle: "智能 Agent 平台" },
			"en-US": { subtitle: "AI Agent Platform" }
		};
		/** Resolve locale tag to brand dictionary accessor. */
		function brandT(locale) {
			const tag = locale?.startsWith("zh") ? "zh-CN" : "en-US";
			const dict = brandMessages[tag];
			return (key) => dict[key];
		}
		//#endregion
		//#region lib/types/client/brand/Brand.js
		/**
		* Render the SupaNexus mark with the presentation requested by its host surface.
		* @param props - Host-supplied mark presentation.
		* @returns the SupaNexus logo mark.
		*/
		function SupaNexusBrandMark({ size, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 512 512",
				width: size,
				height: size,
				className,
				"aria-hidden": true,
				style: {
					display: "block",
					flexShrink: 0,
					borderRadius: 6
				},
				children: [(0, react_jsx_runtime.jsx)("rect", {
					width: "512",
					height: "512",
					fill: "#1212F9",
					rx: "0"
				}), (0, react_jsx_runtime.jsxs)("g", {
					transform: "translate(256,256) scale(0.72) translate(-297.65,-244)",
					children: [(0, react_jsx_runtime.jsx)("path", {
						fill: "white",
						d: "M135.1,158.8c4-24.7,21-37.9,41.6-49.1c30.1-16.4,59.7-33.8,89.1-51.4c20.9-12.5,41.1-12.2,61.9,0\n	c32.9,19.3,66,38.4,99.2,57.2c17.4,9.9,29.5,23.1,31.8,45.1c0.6,15.9,1,30.5,1.4,45.1c-2.6-0.5-5.5-0.3-7.7-1.5\n	c-9.5-5.1-19.1-10.2-28-16.3c-3.4-2.3-6.5-6.9-7.1-10.9c-2-13.3-8.3-23.7-19.5-30.4c-27.3-16.2-54.9-32.1-82.7-47.5\n	c-11.9-6.6-24.9-6.5-36.7,0.1c-27.8,15.5-55.3,31.5-82.8,47.5c-26.4,15.3-25,62.9,0.1,77.5c27.7,16.1,55.3,32.6,83.4,48.1\n	c15,8.3,30.5,5.3,44.1-4c10-6.8,18.2-7.7,28.2-0.1c7.6,5.8,16.5,9.8,24.4,14.4c-0.3,1.7-0.3,2.5-0.6,2.7\n	c-19.9,11.4-39.4,23.5-59.9,33.7c-16.6,8.3-33,2.9-48.2-5.9c-33.5-19.4-66.9-39-100.6-58.2c-17-9.7-28-23.1-30.9-44\n	C135.3,192.7,135.2,175.8,135.1,158.8z"
					}), (0, react_jsx_runtime.jsx)("path", {
						fill: "white",
						d: "M431.4,360.9c-36,20.8-71.4,41.4-107,61.7c-17.1,9.8-34.9,10.5-52.3,0.6c-37-21.1-74-42.4-110.8-64\n	c-16-9.4-24.4-23.8-24.4-42.6c0-13.5,0-27,0-42.8c9.6,5.3,17.3,9.8,25.3,13.8c8.9,4.5,14.7,10.1,15.7,21.2\n	c1,11.3,9.1,19.6,18.7,25.2c26.9,15.9,54,31.6,81.3,46.8c12.7,7.1,26.2,7.2,39,0c26.8-15,53.5-30.3,80.1-45.7\n	c30-17.3,28.3-67-1.4-82.9c-26.1-14-51.3-29.7-77.1-44.2c-16-9-32.5-7.8-47.2,2.4c-10.6,7.3-19.3,6.8-29.2-0.4\n	c-6.8-5-14.5-8.8-23.1-13.8c3.3-2.5,5.2-4.4,7.4-5.7c15.4-8.8,30.7-17.7,46.2-26.2c16-8.8,32.6-9,48.4,0\n	c36.4,20.6,72.5,41.6,108.7,62.6c18.6,10.7,28.3,26.6,28,48.4c-0.2,13.6,0,27.2-0.1,40.7C457.4,335.6,448.5,350.4,431.4,360.9z"
					})]
				})]
			});
		}
		/**
		* Render the SupaNexus wordmark and console subtitle without its slotted mark.
		* @returns the SupaNexus brand name stack.
		*/
		function SupaNexusBrandName({ locale }) {
			const t = brandT(locale);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: brand_module_css_default.brandNameStack,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: brand_module_css_default.wordmark,
					"aria-label": "SupaNexus",
					children: "SupaNexus"
				}), (0, react_jsx_runtime.jsx)("span", {
					className: brand_module_css_default.subtitle,
					children: t("subtitle")
				})]
			});
		}
		function SupaNexusBrandNameSlot({ ctx }) {
			const locale = useClientLocale(ctx);
			return (0, react_jsx_runtime.jsx)(SupaNexusBrandName, { locale });
		}
		//#endregion
		//#region lib/types/client/brand/patchShellBranding.js
		/** Browser tab title + favicon overrides for Supanexus Harness. */
		const PRODUCT_TITLE = "Supanexus Harness";
		const TITLE_REPLACEMENTS = /* @__PURE__ */ new Map([["DSH 本地构建", PRODUCT_TITLE], ["DSH Local Build", PRODUCT_TITLE]]);
		const FAVICON_HREF = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#1212F9"/><g transform="translate(256,256) scale(0.72) translate(-297.65,-244)"><path fill="white" d="M135.1,158.8c4-24.7,21-37.9,41.6-49.1c30.1-16.4,59.7-33.8,89.1-51.4c20.9-12.5,41.1-12.2,61.9,0c32.9,19.3,66,38.4,99.2,57.2c17.4,9.9,29.5,23.1,31.8,45.1c0.6,15.9,1,30.5,1.4,45.1c-2.6-0.5-5.5-0.3-7.7-1.5c-9.5-5.1-19.1-10.2-28-16.3c-3.4-2.3-6.5-6.9-7.1-10.9c-2-13.3-8.3-23.7-19.5-30.4c-27.3-16.2-54.9-32.1-82.7-47.5c-11.9-6.6-24.9-6.5-36.7,0.1c-27.8,15.5-55.3,31.5-82.8,47.5c-26.4,15.3-25,62.9,0.1,77.5c27.7,16.1,55.3,32.6,83.4,48.1c15,8.3,30.5,5.3,44.1-4c10-6.8,18.2-7.7,28.2-0.1c7.6,5.8,16.5,9.8,24.4,14.4c-0.3,1.7-0.3,2.5-0.6,2.7c-19.9,11.4-39.4,23.5-59.9,33.7c-16.6,8.3-33,2.9-48.2-5.9c-33.5-19.4-66.9-39-100.6-58.2c-17-9.7-28-23.1-30.9-44C135.3,192.7,135.2,175.8,135.1,158.8z"/><path fill="white" d="M431.4,360.9c-36,20.8-71.4,41.4-107,61.7c-17.1,9.8-34.9,10.5-52.3,0.6c-37-21.1-74-42.4-110.8-64c-16-9.4-24.4-23.8-24.4-42.6c0-13.5,0-27,0-42.8c9.6,5.3,17.3,9.8,25.3,13.8c8.9,4.5,14.7,10.1,15.7,21.2c1,11.3,9.1,19.6,18.7,25.2c26.9,15.9,54,31.6,81.3,46.8c12.7,7.1,26.2,7.2,39,0c26.8-15,53.5-30.3,80.1-45.7c30-17.3,28.3-67-1.4-82.9c-26.1-14-51.3-29.7-77.1-44.2c-16-9-32.5-7.8-47.2,2.4c-10.6,7.3-19.3,6.8-29.2-0.4c-6.8-5-14.5-8.8-23.1-13.8c3.3-2.5,5.2-4.4,7.4-5.7c15.4-8.8,30.7-17.7,46.2-26.2c16-8.8,32.6-9,48.4,0c36.4,20.6,72.5,41.6,108.7,62.6c18.6,10.7,28.3,26.6,28,48.4c-0.2,13.6,0,27.2-0.1,40.7C457.4,335.6,448.5,350.4,431.4,360.9z"/></g></svg>`)}`;
		let capturedTitle;
		let capturedFaviconHref;
		/** Keep the browser tab title on the Supanexus product name. */
		function patchDocumentProductTitle() {
			if (capturedTitle === void 0) capturedTitle = document.title;
			let next = document.title;
			for (const [from, to] of TITLE_REPLACEMENTS) if (next.includes(from)) next = next.replaceAll(from, to);
			if (next.length === 0) next = PRODUCT_TITLE;
			if (next !== document.title) document.title = next;
		}
		/** Replace the default DSH favicon with the SupaNexus mark. */
		function patchFavicon() {
			const links = document.querySelectorAll("link[rel=\"icon\"], link[rel=\"shortcut icon\"]");
			if (links.length === 0) {
				if (capturedFaviconHref === void 0) capturedFaviconHref = "";
				const link = document.createElement("link");
				link.rel = "icon";
				link.type = "image/svg+xml";
				link.href = FAVICON_HREF;
				link.dataset.supanexusFavicon = "1";
				document.head.appendChild(link);
				return;
			}
			for (const link of links) {
				if (capturedFaviconHref === void 0 && link.href !== FAVICON_HREF) capturedFaviconHref = link.href;
				if (link.href !== FAVICON_HREF) {
					link.href = FAVICON_HREF;
					link.dataset.supanexusFavicon = "1";
				}
			}
		}
		/** Apply browser-tab-only branding patches. */
		function patchTabBranding() {
			patchDocumentProductTitle();
			patchFavicon();
		}
		/** Restore pre-SupaNexus tab title / favicon (DSH defaults). */
		function clearTabBranding() {
			if (capturedTitle !== void 0 && document.title !== capturedTitle) document.title = capturedTitle;
			const injected = document.querySelectorAll("link[data-supanexus-favicon=\"1\"]");
			for (const link of injected) if (capturedFaviconHref !== void 0 && capturedFaviconHref.length > 0) {
				link.href = capturedFaviconHref;
				delete link.dataset.supanexusFavicon;
			} else link.remove();
		}
		/** Keep the tab title and favicon in sync with framework updates. */
		function watchTabBrandingPatches() {
			const run = () => patchTabBranding();
			run();
			const observer = new MutationObserver(run);
			const title = document.querySelector("title");
			if (title !== null) observer.observe(title, {
				childList: true,
				characterData: true,
				subtree: true
			});
			if (document.head !== null) observer.observe(document.head, {
				childList: true,
				subtree: true
			});
			return () => observer.disconnect();
		}
		//#endregion
		//#region lib/types/client/brand/index.js
		/**
		* When `showBrand` is on: occupy brand slots (priority -1 shadows DSH official / shell).
		* When off: dispose occupants so `ui-brand-official` or sidebar fallbacks render again.
		*/
		function registerBrand(ctx, scope) {
			ctx.effect(() => {
				let disposeSlots;
				let stopPatches;
				const sync = () => {
					disposeSlots?.();
					disposeSlots = void 0;
					stopPatches?.();
					stopPatches = void 0;
					if (!readShowBrand(scope)) {
						clearTabBranding();
						return;
					}
					stopPatches = watchTabBrandingPatches();
					disposeSlots = ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", () => ctx.slots.inject("conversation.hero.brand.mark", function* () {
						yield ctx.slots.register({
							name: "sidebar.brand.mark",
							priority: -1,
							registrant: "@supanexus/dsh-plugin-supanexus-core"
						}, SupaNexusBrandMark);
						yield ctx.slots.register({
							name: "sidebar.brand.name",
							priority: -1,
							registrant: "@supanexus/dsh-plugin-supanexus-core"
						}, () => (0, react_jsx_runtime.jsx)(SupaNexusBrandNameSlot, { ctx }));
						yield ctx.slots.register({
							name: "conversation.hero.brand.mark",
							priority: -1,
							registrant: "@supanexus/dsh-plugin-supanexus-core"
						}, SupaNexusBrandMark);
					})));
				};
				sync();
				const unsub = scope.subscribe(sync);
				return () => {
					unsub();
					stopPatches?.();
					disposeSlots?.();
					clearTabBranding();
				};
			}, "supanexus-core: brand");
		}
		//#endregion
		//#region lib/types/client/hero/patchHeroHeadline.js
		/** Official hero headlines replaced by SupaNexus copy until `conversation.hero.headline` slot ships. */
		const HEADLINE_REPLACEMENTS = /* @__PURE__ */ new Map([["探索未至之境", "为你打造专属Agent生态应用"], ["Into the Unknown", "Building your exclusive Agent ecosystem application"]]);
		const HEADLINE_REVERSALS = new Map([...HEADLINE_REPLACEMENTS].map(([from, to]) => [to, from]));
		/** Hero preview badge copy shipped by ui-conversation. */
		const PREVIEW_BADGE_LABELS = /* @__PURE__ */ new Set(["预览版", "Preview"]);
		/**
		* Swap known official hero headline text nodes under `root`.
		* @param root - DOM subtree to scan.
		*/
		function patchHeroHeadlines(root) {
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			let node = walker.nextNode();
			while (node !== null) {
				const text = node.textContent;
				if (text !== null) {
					const next = HEADLINE_REPLACEMENTS.get(text);
					if (next !== void 0) node.textContent = next;
				}
				node = walker.nextNode();
			}
		}
		/** Restore official headlines previously rewritten by {@link patchHeroHeadlines}. */
		function restoreHeroHeadlines(root) {
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			let node = walker.nextNode();
			while (node !== null) {
				const text = node.textContent;
				if (text !== null) {
					const next = HEADLINE_REVERSALS.get(text);
					if (next !== void 0) node.textContent = next;
				}
				node = walker.nextNode();
			}
		}
		/**
		* Hide the official hero preview badge until a slot or locale override is available.
		* @param root - DOM subtree to scan.
		*/
		function hideHeroPreviewBadge(root) {
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			let node = walker.nextNode();
			while (node !== null) {
				const text = node.textContent?.trim();
				if (text !== void 0 && PREVIEW_BADGE_LABELS.has(text)) {
					const element = node.parentElement;
					if (element !== null && element.textContent?.trim() === text) {
						element.style.display = "none";
						element.setAttribute("aria-hidden", "true");
					}
				}
				node = walker.nextNode();
			}
		}
		/** Show previously hidden hero preview badges. */
		function showHeroPreviewBadge(root) {
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			let node = walker.nextNode();
			while (node !== null) {
				const text = node.textContent?.trim();
				if (text !== void 0 && PREVIEW_BADGE_LABELS.has(text)) {
					const element = node.parentElement;
					if (element !== null && element.getAttribute("aria-hidden") === "true") {
						element.style.display = "";
						element.removeAttribute("aria-hidden");
					}
				}
				node = walker.nextNode();
			}
		}
		/** Apply SupaNexus hero chrome patches under `root`. */
		function patchHeroChrome(root) {
			patchHeroHeadlines(root);
			hideHeroPreviewBadge(root);
		}
		/** Undo SupaNexus hero chrome patches under `root`. */
		function clearHeroChrome(root) {
			restoreHeroHeadlines(root);
			showHeroPreviewBadge(root);
		}
		/**
		* Keep hero chrome in sync while the conversation shell mounts or hot-reloads.
		* @returns disposer disconnecting the observer.
		*/
		function watchHeroChromePatches() {
			const run = () => patchHeroChrome(document.body);
			run();
			const observer = new MutationObserver(run);
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				characterData: true
			});
			return () => observer.disconnect();
		}
		//#endregion
		//#region lib/types/client/hero/index.js
		/** Hero headline DOM patches until official slots ship. */
		/** Watch and patch hero chrome copy when brand styling is enabled. */
		function registerHero(ctx, scope) {
			ctx.effect(() => {
				let stopPatches;
				const sync = () => {
					stopPatches?.();
					stopPatches = void 0;
					if (readShowBrand(scope)) stopPatches = watchHeroChromePatches();
					else if (typeof document !== "undefined" && document.body !== null) clearHeroChrome(document.body);
				};
				sync();
				const unsub = scope.subscribe(sync);
				return () => {
					unsub();
					stopPatches?.();
				};
			}, "supanexus-core: hero-chrome");
		}
		//#endregion
		//#region lib/types/client/settings/locales.js
		/** Locales for the SupaNexus plugin settings card. */
		const ZH = {
			title: "SupaNexus",
			description: "平台连接与侧栏展示相关选项。",
			region: "访问区域",
			regionHint: "中国大陆访问更快。仅改变授权、控制台与余额线路；插件下载线路由「插件市场」单独设置。",
			regionGlobal: "全球",
			regionCn: "中国大陆",
			regionLocked: "管理员已锁定访问区域，无法在此切换。",
			regionLoading: "正在探测最快线路…",
			showWallet: "在侧栏显示余额",
			showWalletHint: "关闭后侧栏不再显示余额入口；仅在当前模型服务商为 SupaNexus 时才会出现该入口。",
			showBrand: "显示 SupaNexus 品牌样式",
			showBrandHint: "关闭后恢复 DSH 默认品牌（侧栏 Logo/名称、对话区标识与标题、浏览器标签页）。",
			readOnly: "当前连接为只读，无法保存更改。",
			expand: "展开",
			collapse: "收起"
		};
		const EN = {
			title: "SupaNexus",
			description: "Connection and sidebar display options.",
			region: "Access region",
			regionHint: "Mainland China may be faster. This only changes auth, console, and balance routes; plugin downloads are configured under Plugin Market.",
			regionGlobal: "Global",
			regionCn: "Mainland China",
			regionLocked: "Access region is locked by admin configuration.",
			regionLoading: "Detecting the fastest line…",
			showWallet: "Show balance in sidebar",
			showWalletHint: "When off, the sidebar balance entry is hidden. It only appears when the current model provider is SupaNexus.",
			showBrand: "Show SupaNexus branding",
			showBrandHint: "When off, restores the default DSH brand (sidebar mark/name, conversation hero, and browser tab).",
			readOnly: "This connection is read-only; changes cannot be saved.",
			expand: "Expand",
			collapse: "Collapse"
		};
		function settingsCardT(locale) {
			const table = locale?.toLowerCase().startsWith("zh") ? ZH : EN;
			return (key) => table[key];
		}
		//#endregion
		//#region lib/types/shared/line-contract.js
		/** Line / region status API shared by Host routes and Client settings. */
		const LINE_STATUS_PATH = "/api/supanexus.line.status";
		//#endregion
		//#region lib/types/client/settings/line-wire.js
		/** Browser fetch for region / line status. */
		async function parseJson$3(response) {
			const body = await response.json();
			if (!response.ok || body.ok === false) {
				const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
				throw new Error(message);
			}
			return body;
		}
		/** Resolve (and auto-pin on first call) the auth region line. */
		async function fetchLineStatus() {
			return parseJson$3(await fetch(new URL(LINE_STATUS_PATH, window.location.origin)));
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/settings/settings-card.module.css.mjs
		const css$4 = "._qPHGq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}._qPHGq_card:hover{border-color:var(--dsw-alias-label-dimmed)}._qPHGq_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}._qPHGq_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}._qPHGq_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}._qPHGq_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}._qPHGq_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}._qPHGq_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}._qPHGq_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}._qPHGq_chevronOpen{transform:rotate(180deg)}._qPHGq_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}._qPHGq_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}._qPHGq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}._qPHGq_field+._qPHGq_field{border-top:1px solid var(--dsw-alias-border-l2)}._qPHGq_row{cursor:pointer;color:var(--dsw-alias-label-primary);align-items:center;gap:8px;font-size:13px;font-weight:500;line-height:1.5;display:flex}._qPHGq_rowDisabled{cursor:not-allowed;opacity:.55}._qPHGq_checkbox{width:14px;height:14px;accent-color:var(--dsw-alias-brand-primary);flex:none;margin:0}._qPHGq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}._qPHGq_segment{background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;align-items:stretch;gap:0;width:fit-content;max-width:100%;padding:2px;display:inline-flex}._qPHGq_segmentBtn{appearance:none;font:inherit;cursor:pointer;color:var(--dsw-alias-label-secondary);background:0 0;border:0;border-radius:6px;padding:6px 14px;font-size:13px;font-weight:500;line-height:1.4;transition:background .12s,color .12s}._qPHGq_segmentBtn:hover:not(:disabled){color:var(--dsw-alias-label-primary)}._qPHGq_segmentBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}._qPHGq_segmentBtnActive{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2)}._qPHGq_segmentBtn:disabled{cursor:not-allowed;opacity:.55}";
		const tagId$4 = "@supanexus/dsh-plugin-supanexus-core/settings-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var settings_card_module_css_default = {
			"body": "_qPHGq_body",
			"card": "_qPHGq_card",
			"cardOpen": "_qPHGq_cardOpen",
			"checkbox": "_qPHGq_checkbox",
			"chevron": "_qPHGq_chevron",
			"chevronOpen": "_qPHGq_chevronOpen",
			"description": "_qPHGq_description",
			"field": "_qPHGq_field",
			"headText": "_qPHGq_headText",
			"header": "_qPHGq_header",
			"hint": "_qPHGq_hint",
			"name": "_qPHGq_name",
			"readOnly": "_qPHGq_readOnly",
			"row": "_qPHGq_row",
			"rowDisabled": "_qPHGq_rowDisabled",
			"segment": "_qPHGq_segment",
			"segmentBtn": "_qPHGq_segmentBtn",
			"segmentBtnActive": "_qPHGq_segmentBtnActive"
		};
		//#endregion
		//#region lib/types/client/settings/SupaNexusSettingsCard.js
		/** Same chevron path as `IconChevronDownOutline14` (avoid cross-package value import). */
		function ChevronDown({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				className,
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
					fill: "currentColor"
				})
			});
		}
		const FALLBACK_LINES = [{
			id: "global",
			label: "Global"
		}, {
			id: "cn",
			label: "中国大陆"
		}];
		/** Plugin-config card: region + balance + brand visibility. */
		function SupaNexusSettingsCard(props) {
			const { ctx, scope } = props;
			const t = settingsCardT(useClientLocale(ctx));
			const showWallet = useShowWalletPref(scope);
			const showBrand = useShowBrandPref(scope);
			const { available, writable } = useSettingsWritable(scope);
			const [open, setOpen] = (0, react.useState)(false);
			const [saving, setSaving] = (0, react.useState)(false);
			const [regionLoading, setRegionLoading] = (0, react.useState)(false);
			const [regionLocked, setRegionLocked] = (0, react.useState)(false);
			const [regionLines, setRegionLines] = (0, react.useState)(FALLBACK_LINES);
			const [activeLineId, setActiveLineId] = (0, react.useState)(() => readActiveLineId(scope));
			(0, react.useEffect)(() => scope.subscribe(() => {
				setActiveLineId(readActiveLineId(scope));
			}), [scope]);
			(0, react.useEffect)(() => {
				if (!open || !available) return;
				let cancelled = false;
				setRegionLoading(true);
				fetchLineStatus().then((status) => {
					if (cancelled) return;
					setRegionLines(status.lines.length > 0 ? status.lines : FALLBACK_LINES);
					setActiveLineId(status.activeLineId);
					setRegionLocked(status.locked);
				}).catch(() => {}).finally(() => {
					if (!cancelled) setRegionLoading(false);
				});
				return () => {
					cancelled = true;
				};
			}, [open, available]);
			const onToggle = (0, react.useCallback)(async (field, checked) => {
				if (!writable || saving) return;
				setSaving(true);
				try {
					await scope.set(field, checked);
				} finally {
					setSaving(false);
				}
			}, [
				scope,
				saving,
				writable
			]);
			const onSelectRegion = (0, react.useCallback)(async (lineId) => {
				if (!writable || saving || regionLocked || lineId === activeLineId) return;
				setSaving(true);
				try {
					await scope.set(PINNED_LINE_FIELD, lineId);
					setActiveLineId(lineId);
				} finally {
					setSaving(false);
				}
			}, [
				activeLineId,
				regionLocked,
				saving,
				scope,
				writable
			]);
			if (!available) return null;
			const title = t("title");
			const regionDisabled = !writable || saving || regionLocked || regionLoading;
			return (0, react_jsx_runtime.jsxs)("li", {
				className: open ? `${settings_card_module_css_default.card} ${settings_card_module_css_default.cardOpen}` : settings_card_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: settings_card_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: title
						}), (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							children: t("description")
						})]
					}), (0, react_jsx_runtime.jsx)(ChevronDown, { className: [settings_card_module_css_default.chevron, open ? settings_card_module_css_default.chevronOpen : void 0].filter(Boolean).join(" ") })]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						!writable ? (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.readOnly,
							role: "status",
							children: t("readOnly")
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: settings_card_module_css_default.row,
									style: { cursor: "default" },
									children: t("region")
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: settings_card_module_css_default.segment,
									role: "radiogroup",
									"aria-label": t("region"),
									"aria-busy": regionLoading,
									children: regionLines.map((line) => {
										const selected = line.id === activeLineId;
										const label = line.id === "cn" ? t("regionCn") : line.id === "global" ? t("regionGlobal") : line.label;
										return (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											role: "radio",
											"aria-checked": selected,
											className: selected ? `${settings_card_module_css_default.segmentBtn} ${settings_card_module_css_default.segmentBtnActive}` : settings_card_module_css_default.segmentBtn,
											disabled: regionDisabled,
											onClick: () => {
												onSelectRegion(line.id);
											},
											children: label
										}, line.id);
									})
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: settings_card_module_css_default.hint,
									children: regionLocked ? t("regionLocked") : regionLoading ? t("regionLoading") : t("regionHint")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								className: writable ? settings_card_module_css_default.row : `${settings_card_module_css_default.row} ${settings_card_module_css_default.rowDisabled}`,
								children: [(0, react_jsx_runtime.jsx)("input", {
									className: settings_card_module_css_default.checkbox,
									type: "checkbox",
									checked: showWallet,
									disabled: !writable || saving,
									onChange: (event) => {
										onToggle(SHOW_WALLET_FIELD, event.target.checked);
									}
								}), (0, react_jsx_runtime.jsx)("span", { children: t("showWallet") })]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: settings_card_module_css_default.hint,
								children: t("showWalletHint")
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								className: writable ? settings_card_module_css_default.row : `${settings_card_module_css_default.row} ${settings_card_module_css_default.rowDisabled}`,
								children: [(0, react_jsx_runtime.jsx)("input", {
									className: settings_card_module_css_default.checkbox,
									type: "checkbox",
									checked: showBrand,
									disabled: !writable || saving,
									onChange: (event) => {
										onToggle(SHOW_BRAND_FIELD, event.target.checked);
									}
								}), (0, react_jsx_runtime.jsx)("span", { children: t("showBrand") })]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: settings_card_module_css_default.hint,
								children: t("showBrandHint")
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/settings/index.js
		/** Register `settings.plugin.item` keyed by the Host `supanexus` namespace. */
		function registerPluginSettings(ctx, scope) {
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				key: SUPANEXUS_SETTINGS_NS
			}, (props) => (0, react_jsx_runtime.jsx)(SupaNexusSettingsCard, {
				ctx,
				scope,
				...props
			})));
		}
		//#endregion
		//#region lib/types/shared/auth-contract.js
		/** Connection fetch routes (GET only). */
		const AUTH_START_PATH = "/api/supanexus.auth.start";
		const AUTH_STATUS_PATH = "/api/supanexus.auth.status";
		//#endregion
		//#region lib/types/client/quick-setup/wire.js
		/** Browser fetch wrappers for SupaNexus host API routes. */
		async function readResponseBody$2(response) {
			if ((response.headers.get("content-type") ?? "").includes("application/json")) return response.json();
			const text = await response.text();
			if (text.length === 0) return {};
			try {
				return JSON.parse(text);
			} catch {
				return { message: text };
			}
		}
		async function parseJson$2(response) {
			const body = await readResponseBody$2(response);
			if (!response.ok || body.ok === false) {
				if (response.status === 404) throw new Error(typeof body.message === "string" && body.message.length > 0 ? body.message : "HOST_API_NOT_FOUND");
				const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
				throw new Error(message);
			}
			return body;
		}
		/** Start OAuth flow; host resolves the pinned / auto region line. */
		async function startAuth(locale) {
			const url = new URL(AUTH_START_PATH, window.location.origin);
			if (locale !== void 0 && locale.length > 0) url.searchParams.set("locale", locale);
			return parseJson$2(await fetch(url));
		}
		/** Poll auth flow status. */
		async function fetchAuthStatus(flowId) {
			const url = new URL(AUTH_STATUS_PATH, window.location.origin);
			url.searchParams.set("flowId", flowId);
			return parseJson$2(await fetch(url));
		}
		//#endregion
		//#region lib/types/shared/provider.js
		/** Provider write targets in engine-standard settings / credentials storage. */
		/** Settings namespace for pi-ai custom providers. */
		const PROVIDER_NS = "llm-pi-ai";
		/** Fixed route id for the SupaNexus provider row. */
		const PROVIDER_ROUTE_ID = "supanexus";
		/** Credential ref written by Host; referenced in provider profile. */
		const CREDENTIAL_REF = "SUPANEXUS_API_KEY";
		/** Wire protocol for the custom provider profile. */
		const PROVIDER_API = "openai-completions";
		/** Display name shown in the Models list. */
		const PROVIDER_DISPLAY_NAME = "SupaNexus";
		//#endregion
		//#region lib/types/client/quick-setup/provider-write.js
		/** Write SupaNexus provider profile into engine-standard llm-pi-ai settings. */
		async function revisionOf(settings) {
			const response = await settings.describe();
			if (!response.ok) throw new Error(response.error.message);
			return response.value.namespaces.find((ns) => ns.ns === PROVIDER_NS)?.revision;
		}
		/** Create or replace the supanexus provider row (credentials already on Host). */
		async function writeSupaNexusProvider(settings, input) {
			const revision = await revisionOf(settings);
			const value = {
				displayName: PROVIDER_DISPLAY_NAME,
				apiKeyEnv: CREDENTIAL_REF,
				api: PROVIDER_API,
				baseURL: input.baseURL,
				models: input.models.map((model) => ({
					id: model.id,
					...model.name === void 0 ? {} : { name: model.name },
					...model.contextWindow === void 0 ? {} : { contextWindow: model.contextWindow },
					...model.input === void 0 || model.input.length === 0 ? {} : { input: [...model.input] }
				}))
			};
			const response = await settings.mutate(PROVIDER_NS, [{
				op: "set",
				path: ["providers", PROVIDER_ROUTE_ID],
				value
			}], revision);
			if (!response.ok) {
				if (response.error.code === "settings-conflict") {
					const retryRevision = await revisionOf(settings);
					const retry = await settings.mutate(PROVIDER_NS, [{
						op: "set",
						path: ["providers", PROVIDER_ROUTE_ID],
						value
					}], retryRevision);
					if (!retry.ok) throw new Error(retry.error.message);
					return;
				}
				throw new Error(response.error.message);
			}
		}
		//#endregion
		//#region lib/types/client/quick-setup/locales.js
		/** Quick-setup copy keys. */
		const quickSetupMessages = {
			"zh-CN": {
				title: "SupaNexus 快速配置",
				description: "登录授权后自动添加 SupaNexus 模型提供方，无需手填 API Key。",
				quickSetup: "快速配置",
				reopenAuth: "重新打开授权页",
				awaiting: "请在浏览器中完成授权…",
				writing: "正在写入模型提供方…",
				done: "SupaNexus 已配置，可在上方列表中使用。",
				error: "配置失败",
				hostApiMissing: "Host 端接口未就绪。请在插件目录执行 pnpm build，然后完全重启 dsh web / Desktop（仅刷新浏览器不够）。",
				unauthorized: "会话未授权，请关闭页面后用终端里带 ?token= 的 dsh web 地址重新打开。"
			},
			"en-US": {
				title: "SupaNexus Quick Setup",
				description: "Sign in to add the SupaNexus provider automatically — no API key typing.",
				quickSetup: "Quick setup",
				reopenAuth: "Reopen authorization",
				awaiting: "Complete authorization in your browser…",
				writing: "Writing model provider…",
				done: "SupaNexus is configured. Use it in the list above.",
				error: "Setup failed",
				hostApiMissing: "Host API is not ready. Run pnpm build in the plugin directory, then fully restart dsh web / Desktop (refreshing the browser is not enough).",
				unauthorized: "Session is not authorized. Close this tab and reopen using the dsh web URL with ?token= from your terminal."
			}
		};
		/** Resolve locale tag to a supported quick-setup dictionary. */
		function quickSetupT(locale) {
			const tag = locale?.startsWith("zh") ? "zh-CN" : "en-US";
			const dict = quickSetupMessages[tag];
			return (key) => dict[key];
		}
		//#endregion
		//#region lib/types/client/quick-setup/useQuickSetup.js
		function formatWireError(error, locale) {
			const t = quickSetupT(locale);
			if (error instanceof Error) {
				if (error.message === "HOST_API_NOT_FOUND" || error.message === "not found") return t("hostApiMissing");
				if (error.message === "unauthorized") return t("unauthorized");
				return error.message;
			}
			return t("error");
		}
		const POLL_MS = 1500;
		const MAX_POLL_MS = 6e5;
		/** Quick-setup state machine: authorize → poll → write provider (auth line resolved on host). */
		function useQuickSetup(options) {
			const { ctx, locale } = options;
			const [phase, setPhase] = (0, react.useState)("idle");
			const [flowId, setFlowId] = (0, react.useState)();
			const [authorizeUrl, setAuthorizeUrl] = (0, react.useState)();
			const [message, setMessage] = (0, react.useState)();
			const pollStartedAt = (0, react.useRef)();
			const pollTimer = (0, react.useRef)();
			const clearPoll = (0, react.useCallback)(() => {
				if (pollTimer.current !== void 0) {
					clearTimeout(pollTimer.current);
					pollTimer.current = void 0;
				}
			}, []);
			(0, react.useEffect)(() => () => clearPoll(), [clearPoll]);
			const handleDone = (0, react.useCallback)(async (status) => {
				if (status.baseURL === void 0 || status.models === void 0) throw new Error(quickSetupT(locale)("error"));
				setPhase("writing");
				await writeSupaNexusProvider(ctx.remote.settings, {
					baseURL: status.baseURL,
					models: status.models
				});
				setPhase("done");
				setMessage(quickSetupT(locale)("done"));
			}, [ctx.remote.settings, locale]);
			const schedulePoll = (0, react.useCallback)((id) => {
				clearPoll();
				if (pollStartedAt.current === void 0) pollStartedAt.current = Date.now();
				pollTimer.current = setTimeout(() => {
					(async () => {
						if (pollStartedAt.current !== void 0 && Date.now() - pollStartedAt.current > MAX_POLL_MS) {
							setPhase("error");
							setMessage(quickSetupT(locale)("error"));
							return;
						}
						try {
							const status = await fetchAuthStatus(id);
							if (status.phase === "done") {
								await handleDone(status);
								return;
							}
							if (status.phase === "error") {
								setPhase("error");
								setMessage(status.message ?? quickSetupT(locale)("error"));
								return;
							}
							schedulePoll(id);
						} catch (error) {
							setPhase("error");
							setMessage(formatWireError(error, locale));
						}
					})();
				}, POLL_MS);
			}, [
				clearPoll,
				handleDone,
				locale
			]);
			return {
				phase,
				flowId,
				authorizeUrl,
				message,
				start: (0, react.useCallback)(async () => {
					clearPoll();
					pollStartedAt.current = void 0;
					setMessage(void 0);
					setPhase("starting");
					try {
						const started = await startAuth(locale);
						setFlowId(started.flowId);
						setAuthorizeUrl(started.authorizeUrl);
						setPhase("awaiting-approval");
						window.open(started.authorizeUrl, "_blank", "noopener,noreferrer");
						schedulePoll(started.flowId);
					} catch (error) {
						setPhase("error");
						setMessage(formatWireError(error, locale));
					}
				}, [
					clearPoll,
					locale,
					schedulePoll
				]),
				reopenAuth: (0, react.useCallback)(() => {
					if (authorizeUrl !== void 0) window.open(authorizeUrl, "_blank", "noopener,noreferrer");
				}, [authorizeUrl])
			};
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/quick-setup/quick-setup.module.css.mjs
		const css$3 = ".Y8ZD8G_quickSetupCard{border:1px dashed #0000001f;border-radius:10px;flex-direction:column;gap:12px;margin-top:12px;padding:16px;display:flex}.Y8ZD8G_title{margin:0;font-size:14px;font-weight:600}.Y8ZD8G_description{opacity:.75;margin:0;font-size:12px;line-height:1.5}.Y8ZD8G_actions{flex-wrap:wrap;gap:8px;display:flex}.Y8ZD8G_button{cursor:pointer;color:#fff;background:#1212f9;border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:500}.Y8ZD8G_button:disabled{cursor:not-allowed;opacity:.55}.Y8ZD8G_buttonSecondary{color:inherit;background:0 0;border:1px solid #00000026;}.Y8ZD8G_status{opacity:.8;font-size:12px}.Y8ZD8G_error{color:#c41e3a;font-size:12px}.Y8ZD8G_success{color:#0a7a3e;font-size:12px}";
		const tagId$3 = "@supanexus/dsh-plugin-supanexus-core/quick-setup.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var quick_setup_module_css_default = {
			"actions": "Y8ZD8G_actions",
			"button": "Y8ZD8G_button",
			"buttonSecondary": "Y8ZD8G_buttonSecondary",
			"description": "Y8ZD8G_description",
			"error": "Y8ZD8G_error",
			"quickSetupCard": "Y8ZD8G_quickSetupCard",
			"status": "Y8ZD8G_status",
			"success": "Y8ZD8G_success",
			"title": "Y8ZD8G_title"
		};
		//#endregion
		//#region lib/types/client/quick-setup/QuickSetupCard.js
		/** Models footer card: one-click SupaNexus OAuth setup. */
		function QuickSetupCard(props) {
			const t = quickSetupT(props.locale);
			const state = useQuickSetup({
				ctx: props.ctx,
				locale: props.locale
			});
			const busy = state.phase === "starting" || state.phase === "writing";
			return (0, react_jsx_runtime.jsxs)("section", {
				className: quick_setup_module_css_default.quickSetupCard,
				"aria-label": t("title"),
				children: [
					(0, react_jsx_runtime.jsx)("h3", {
						className: quick_setup_module_css_default.title,
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: quick_setup_module_css_default.description,
						children: t("description")
					}),
					state.phase === "awaiting-approval" && (0, react_jsx_runtime.jsx)("p", {
						className: quick_setup_module_css_default.status,
						children: t("awaiting")
					}),
					state.phase === "writing" && (0, react_jsx_runtime.jsx)("p", {
						className: quick_setup_module_css_default.status,
						children: t("writing")
					}),
					state.phase === "done" && state.message !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: quick_setup_module_css_default.success,
						children: state.message
					}),
					state.phase === "error" && state.message !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: quick_setup_module_css_default.error,
						children: state.message
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: quick_setup_module_css_default.actions,
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: quick_setup_module_css_default.button,
							disabled: busy,
							onClick: () => {
								state.start();
							},
							children: t("quickSetup")
						}), state.phase === "awaiting-approval" && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: quick_setup_module_css_default.buttonSecondary,
							onClick: state.reopenAuth,
							children: t("reopenAuth")
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/quick-setup/index.js
		/** Register the Models settings footer quick-setup card. */
		function registerQuickSetup(ctx) {
			const locale = ctx.locale.getSnapshot().active;
			ctx.slots.inject("settings.models.footer", () => ctx.slots.register({
				name: "settings.models.footer",
				id: "supanexus-quick-setup",
				order: 0
			}, () => (0, react_jsx_runtime.jsx)(QuickSetupCard, {
				ctx,
				locale
			})));
		}
		//#endregion
		//#region lib/types/client/skill-market/locales.js
		/** Skill market copy keys. */
		const skillMarketMessages = {
			"zh-CN": {
				nav: "应用插件",
				title: "应用插件",
				subtitle: "发现 DSH 插件：安装时按网络自动选择仓库。文档与主页见卡片底部。",
				searchPlaceholder: "搜索插件…",
				filterAll: "全部来源",
				sourceSupanexus: "SupaNexus",
				sourceCommunity: "DSH 社区",
				layerAll: "全部层级",
				categoryAll: "全部分类",
				categoryNavTitle: "分类",
				collapseCategories: "收起分类",
				expandCategories: "展开分类",
				layerCore: "核心",
				layerFeature: "功能",
				loadFailed: "加载失败",
				empty: "暂无已发布插件",
				install: "安装",
				installing: "安装中…",
				installed: "已安装",
				uninstall: "卸载",
				uninstalling: "卸载中…",
				uninstallConfirm: "确定要卸载「{name}」吗？卸载后需重启服务生效。",
				uninstallFailed: "卸载失败",
				uninstallOk: "已卸载，请重启服务后生效。",
				uninstallModalTitleConfirm: "卸载插件",
				uninstallModalConfirmHint: "确认卸载该插件？将执行 dsh plugin remove，完成后需重启服务生效。",
				uninstallModalStart: "开始卸载",
				uninstallModalTitleRunning: "正在卸载插件",
				uninstallModalTitleSuccess: "卸载完成",
				uninstallModalTitleFailed: "卸载失败",
				uninstallModalRunning: "正在执行 dsh plugin remove，请勿关闭窗口…",
				installOk: "安装完成，请重启应用后生效。",
				installOkVia: "已通过 {provider} 安装，请重启服务后生效。",
				installFailed: "安装失败",
				installWait: "请等待…",
				installModalTitleConfirm: "安装插件",
				installModalConfirmHint: "确认安装该插件？将执行 dsh plugin add，完成后需重启服务生效。",
				installModalStart: "开始安装",
				installModalCancel: "取消",
				installModalTitleRunning: "正在安装插件",
				installModalTitleSuccess: "安装完成",
				installModalTitleFailed: "安装失败",
				installModalPlugin: "插件",
				installModalPackage: "包名",
				installModalRunning: "正在执行 dsh plugin add，请勿关闭窗口…",
				installModalShowLog: "查看安装日志",
				installModalHideLog: "收起安装日志",
				installModalClose: "关闭",
				installModalWorking: "安装中…",
				installModalFailedHint: "可展开日志查看各渠道命令与终端输出。",
				openRepo: "仓库",
				openDocs: "文档",
				openHomepage: "主页",
				officialSite: "SupaNexus 官方网站",
				githubPlugins: "GitHub 社区插件",
				loadMore: "加载更多",
				close: "关闭",
				restart: "重启应用",
				restartServiceConfirmTitle: "确认重启",
				restartService: "重启服务",
				restartServiceHint: "将重新启动 dsh web Host 进程，页面会短暂断开并自动恢复。",
				restartServiceConfirm: "确定要重启 dsh web 服务吗？当前页面会短暂断开。",
				restartServiceConfirmAction: "确认重启",
				restartServiceCancel: "取消",
				restartServiceWorking: "正在重启服务",
				restartServiceWorkingButton: "重启中…",
				restartServiceWorkingHint: "Host 正在重启，页面将在数秒后自动刷新…",
				restartServiceFailed: "重启失败，请查看终端日志或在终端手动重启 dsh web。",
				restartApiMissing: "Host 重启接口未加载。请在插件目录执行 pnpm build，然后完全重启 dsh web（仅刷新浏览器不够）。",
				restartHint: "请在运行 dsh web 的终端中停止后重新启动，或换用支持一键重启的环境。",
				hostApiMissing: "Host 端接口未就绪。请在插件目录执行 pnpm build，然后完全重启 dsh web / Desktop。",
				layoutCols3: "三列",
				layoutCols1: "单列",
				layoutLabel: "布局",
				tabInstalled: "已安装",
				tabNotInstalled: "未安装",
				emptyInstalled: "暂无已安装插件",
				emptyNotInstalled: "暂无未安装插件",
				upgradeAvailable: "可升级",
				upgrade: "升级",
				upgradeTo: "升级至 {version}",
				upgrading: "升级中…",
				upgradeFailed: "升级失败",
				upgradeOk: "升级完成，请重启服务后生效。",
				upgradeOkVersion: "已升级至 {version}，请重启服务后生效。",
				upgradeModalTitleConfirm: "升级插件",
				upgradeModalConfirmHint: "将按运营配置的仓库标签安装推荐版本，完成后需重启服务生效。",
				upgradeModalConfirmHintVersion: "将升级至运营目标版本 {version}，完成后需重启服务生效。",
				upgradeModalStart: "开始升级",
				upgradeModalTitleRunning: "正在升级插件",
				upgradeModalTitleSuccess: "升级完成",
				upgradeModalTitleFailed: "升级失败",
				upgradeModalRunning: "正在执行 dsh plugin add，请勿关闭窗口…",
				upgradeModalTargetVersion: "目标",
				upgradeModalRemoteVersion: "远端 package.json 版本",
				checkingRemoteVersion: "正在读取远端 package.json 版本…",
				remoteVersionUnknown: "未知",
				pluginEnabled: "已启用",
				pluginDisabled: "已禁用",
				toggleEnable: "启用",
				toggleDisable: "禁用",
				toggling: "切换中…",
				toggleFailed: "开关失败"
			},
			"en-US": {
				nav: "App Plugins",
				title: "App Plugins",
				subtitle: "Discover DSH plugins: install picks a repository by network. Docs and homepage are in each card footer.",
				searchPlaceholder: "Search plugins…",
				filterAll: "All sources",
				sourceSupanexus: "SupaNexus",
				sourceCommunity: "DSH community",
				layerAll: "All layers",
				categoryAll: "All categories",
				categoryNavTitle: "Categories",
				collapseCategories: "Collapse categories",
				expandCategories: "Expand categories",
				layerCore: "Core",
				layerFeature: "Feature",
				loadFailed: "Failed to load",
				empty: "No published plugins yet",
				install: "Install",
				installing: "Installing…",
				installed: "Installed",
				uninstall: "Uninstall",
				uninstalling: "Uninstalling…",
				uninstallConfirm: "Uninstall \"{name}\"? Restart the service afterward to apply.",
				uninstallFailed: "Uninstall failed",
				uninstallOk: "Uninstalled. Restart the service to apply changes.",
				uninstallModalTitleConfirm: "Uninstall plugin",
				uninstallModalConfirmHint: "Start uninstallation? This runs dsh plugin remove. Restart the service when it finishes.",
				uninstallModalStart: "Start uninstall",
				uninstallModalTitleRunning: "Uninstalling plugin",
				uninstallModalTitleSuccess: "Uninstall complete",
				uninstallModalTitleFailed: "Uninstall failed",
				uninstallModalRunning: "Running dsh plugin remove — please keep this window open…",
				installOk: "Installed. Restart the app to activate the plugin.",
				installOkVia: "Installed via {provider}. Restart the service to activate the plugin.",
				installFailed: "Install failed",
				installWait: "Please wait…",
				installModalTitleConfirm: "Install plugin",
				installModalConfirmHint: "Start installation? This runs dsh plugin add. Restart the service when it finishes.",
				installModalStart: "Start install",
				installModalCancel: "Cancel",
				installModalTitleRunning: "Installing plugin",
				installModalTitleSuccess: "Install complete",
				installModalTitleFailed: "Install failed",
				installModalPlugin: "Plugin",
				installModalPackage: "Package",
				installModalRunning: "Running dsh plugin add — please keep this window open…",
				installModalShowLog: "Show install log",
				installModalHideLog: "Hide install log",
				installModalClose: "Close",
				installModalWorking: "Installing…",
				installModalFailedHint: "Expand the log to see commands and terminal output for each channel.",
				openRepo: "Repository",
				openDocs: "Docs",
				openHomepage: "Homepage",
				officialSite: "SupaNexus official site",
				githubPlugins: "GitHub community",
				loadMore: "Load more",
				close: "Close",
				restart: "Restart app",
				restartServiceConfirmTitle: "Confirm restart",
				restartService: "Restart service",
				restartServiceHint: "This relaunches the dsh web Host process. The page will disconnect briefly.",
				restartServiceConfirm: "Restart the dsh web service now? The page will disconnect briefly.",
				restartServiceConfirmAction: "Confirm restart",
				restartServiceCancel: "Cancel",
				restartServiceWorking: "Restarting service",
				restartServiceWorkingButton: "Restarting…",
				restartServiceWorkingHint: "The Host is restarting. This page will reload in a few seconds…",
				restartServiceFailed: "Restart failed. Check the terminal or restart dsh web manually.",
				restartApiMissing: "Host restart API is not loaded. Run pnpm build in the plugin directory, then fully restart dsh web (refreshing the browser is not enough).",
				restartHint: "Stop and rerun dsh web in your terminal, or use an environment that supports one-click restart.",
				hostApiMissing: "Host API is not ready. Run pnpm build in the plugin directory, then fully restart dsh web / Desktop.",
				layoutCols3: "3 columns",
				layoutCols1: "1 column",
				layoutLabel: "Layout",
				tabInstalled: "Installed",
				tabNotInstalled: "Not installed",
				emptyInstalled: "No installed plugins",
				emptyNotInstalled: "No plugins to install",
				upgradeAvailable: "Update available",
				upgrade: "Upgrade",
				upgradeTo: "Upgrade to {version}",
				upgrading: "Upgrading…",
				upgradeFailed: "Upgrade failed",
				upgradeOk: "Upgraded. Restart the service to apply changes.",
				upgradeOkVersion: "Upgraded to {version}. Restart the service to apply changes.",
				upgradeModalTitleConfirm: "Upgrade plugin",
				upgradeModalConfirmHint: "Install the recommended release from the operational repository ref. Restart the service when it finishes.",
				upgradeModalConfirmHintVersion: "Upgrade to operational target version {version}. Restart the service when it finishes.",
				upgradeModalStart: "Start upgrade",
				upgradeModalTitleRunning: "Upgrading plugin",
				upgradeModalTitleSuccess: "Upgrade complete",
				upgradeModalTitleFailed: "Upgrade failed",
				upgradeModalRunning: "Running dsh plugin add — please keep this window open…",
				upgradeModalTargetVersion: "Target",
				upgradeModalRemoteVersion: "Remote package.json version",
				checkingRemoteVersion: "Reading remote package.json version…",
				remoteVersionUnknown: "Unknown",
				pluginEnabled: "Enabled",
				pluginDisabled: "Disabled",
				toggleEnable: "Enable",
				toggleDisable: "Disable",
				toggling: "Toggling…",
				toggleFailed: "Toggle failed"
			}
		};
		/** Resolve locale tag to skill-market dictionary accessor. */
		function skillMarketT(locale) {
			const tag = locale?.startsWith("zh") ? "zh-CN" : "en-US";
			const dict = skillMarketMessages[tag];
			return (key) => dict[key];
		}
		function skillMarketLocaleParam(locale) {
			return locale?.startsWith("zh") ? "zh-CN" : "en-US";
		}
		//#endregion
		//#region lib/types/shared/official-site.js
		/** SupaNexus official marketing site (.ai / .io) from dual-line config. */
		/** Production official site for the Global / .ai fleet. */
		const OFFICIAL_SITE_AI = "https://supanexus.ai";
		/** Production official site for the CN / .io fleet. */
		const OFFICIAL_SITE_IO = "https://supanexus.io";
		/**
		* Pick official site base from line id or API origin host.
		* - `cn` or `*.supanexus.io` → https://supanexus.io
		* - otherwise (incl. `global`, `*.supanexus.ai`, unset) → https://supanexus.ai
		*/
		function resolveOfficialSiteBase(options = {}) {
			if ((options.lineId?.trim().toLowerCase() ?? "") === "cn") return OFFICIAL_SITE_IO;
			const origin = options.lineOrigin?.trim().toLowerCase() ?? "";
			if (origin.includes("supanexus.io")) return OFFICIAL_SITE_IO;
			if (origin.includes("supanexus.ai")) return OFFICIAL_SITE_AI;
			return OFFICIAL_SITE_AI;
		}
		/**
		* Official site URL with locale path (`/zh` or `/en`), matching official site routing.
		*/
		function buildOfficialSiteUrl(options = {}) {
			return `${resolveOfficialSiteBase(options)}/${options.locale?.toLowerCase().startsWith("zh") ? "zh" : "en"}`;
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/skill-market/skill-market.module.css.mjs
		const css$2 = ".WDqkOq_layer{flex:none;align-items:center;width:100%;display:flex;position:relative}.WDqkOq_trigger{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}.WDqkOq_trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}.WDqkOq_trigger.WDqkOq_rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}.WDqkOq_triggerLabel{white-space:nowrap;overflow:hidden}.WDqkOq_overlay{z-index:1000;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.WDqkOq_mask{background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);position:absolute;inset:0}.WDqkOq_panel{z-index:1;background:var(--dsw-alias-bg-layer-2);width:min(1200px,100vw - 32px);height:min(880px,100vh - 32px);box-shadow:var(--dsw-shadow-lv3);border-radius:24px;flex-direction:column;display:flex;position:relative;overflow:hidden}.WDqkOq_header{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 24px 12px;display:flex}.WDqkOq_titleBlock{min-width:0}.WDqkOq_title{margin:0;font-size:18px;font-weight:600;line-height:1.3}.WDqkOq_subtitle{color:var(--dsw-alias-label-secondary);margin:6px 0 0;font-size:13px;line-height:1.5}.WDqkOq_headerActions{flex:none;align-items:center;gap:8px;display:flex}.WDqkOq_headerLink{border:1px solid var(--dsw-alias-border-l2);height:32px;color:var(--dsw-alias-label-primary);white-space:nowrap;border-radius:8px;align-items:center;padding:0 10px;font-size:13px;font-weight:500;line-height:1;text-decoration:none;display:inline-flex}.WDqkOq_headerLink:hover{background:var(--dsw-alias-interactive-bg-hover)}.WDqkOq_closeButton{width:32px;height:32px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:8px;flex:none;justify-content:center;align-items:center;display:inline-flex}.WDqkOq_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.WDqkOq_tabBar{flex:none;align-items:center;padding:0 0 12px;display:flex}.WDqkOq_segmentGroup{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;align-items:center;gap:2px;padding:3px;display:inline-flex}.WDqkOq_segmentGroupEnd{margin-left:auto}.WDqkOq_segmentButton{background:var(--dsw-alias-interactive-bg-hover);min-width:72px;height:32px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border:none;border-radius:7px;padding:0 14px;font-size:13px;line-height:1;transition:background .15s,color .15s,box-shadow .15s}.WDqkOq_segmentButton:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.WDqkOq_segmentButtonActive{background:var(--dsw-alias-bg-layer-2);min-width:72px;height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:none;border-radius:7px;padding:0 14px;font-size:13px;font-weight:500;line-height:1;transition:background .15s,color .15s,box-shadow .15s;box-shadow:0 1px 2px #00000014}.WDqkOq_segmentButtonCompact{min-width:52px}.WDqkOq_segmentButtonIcon{justify-content:center;align-items:center;width:32px;min-width:32px;padding:0;display:inline-flex}.WDqkOq_body{flex-direction:column;flex:1;min-height:0;padding:0;display:flex;overflow:hidden}.WDqkOq_bodyLayout{border-top:1px solid var(--dsw-alias-border-l2);flex:1;min-height:0;display:flex;overflow:hidden}.WDqkOq_categorySidebar{border-right:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);flex-direction:column;flex:none;width:168px;min-height:0;transition:width .2s;display:flex}.WDqkOq_categorySidebarCollapsed{width:40px}.WDqkOq_categorySidebarHead{box-sizing:border-box;flex:none;justify-content:space-between;align-items:center;gap:6px;min-height:48px;padding:12px 12px 8px;display:flex}.WDqkOq_categorySidebarCollapsed .WDqkOq_categorySidebarHead{justify-content:center;padding:12px 6px 8px}.WDqkOq_categorySidebarTitle{min-width:0;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis;flex:1;font-size:12px;font-weight:600;line-height:1.3;overflow:hidden}.WDqkOq_categoryNav{scrollbar-width:thin;flex-direction:column;flex:1;gap:4px;min-height:0;padding:0 10px 12px;display:flex;overflow:hidden auto}.WDqkOq_categoryNavItem{width:100%;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer;appearance:none;box-sizing:border-box;background:0 0;border:none;border-radius:10px;margin:0;padding:9px 12px;font-size:13px;line-height:1.35;transition:background .15s,color .15s;display:block;position:relative}.WDqkOq_categoryNavItem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.WDqkOq_categoryNavItem:focus{outline:none}.WDqkOq_categoryNavItem:focus-visible{box-shadow:0 0 0 2px #1212f938}.WDqkOq_categoryNavItemActive{color:var(--dsw-alias-label-primary);background:#1212f914;font-weight:500}.WDqkOq_categoryNavItemActive:before{content:\"\";background:var(--dsw-alias-interactive-bg-accent,#1212f9);border-radius:999px;width:3px;height:18px;position:absolute;top:50%;left:4px;transform:translateY(-50%)}.WDqkOq_sidebarToggle{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:28px;height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;appearance:none;border-radius:8px;flex:none;justify-content:center;align-items:center;margin:0;padding:0;font-size:16px;line-height:1;display:inline-flex}.WDqkOq_sidebarToggle:focus{outline:none}.WDqkOq_sidebarToggle:focus-visible{box-shadow:0 0 0 2px #1212f938}.WDqkOq_sidebarToggle:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.WDqkOq_mainContent{flex-direction:column;flex:1;gap:12px;min-width:0;min-height:0;padding:12px 20px 0;display:flex;overflow:hidden}.WDqkOq_toolbar{border-top:none;flex-wrap:wrap;flex:none;align-items:center;gap:8px;padding-top:0;display:flex}.WDqkOq_gridScroll{flex:1;min-height:0;padding-right:4px;overflow-y:auto}.WDqkOq_grid{gap:14px;display:grid}.WDqkOq_gridCols3{grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}.WDqkOq_cardGrid{height:100%}.WDqkOq_gridCols1{grid-template-columns:minmax(0,1fr)}.WDqkOq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-direction:column;gap:0;min-width:0;display:flex;overflow:hidden}.WDqkOq_cardBody{flex-direction:column;flex:auto;gap:8px;min-height:0;padding:14px 14px 10px;display:flex}.WDqkOq_cardHead{align-items:flex-start;gap:8px;display:flex}.WDqkOq_cardHeadText{flex:1;min-width:0}.WDqkOq_cardIcon,.WDqkOq_cardIconFallback{border-radius:10px;flex:none;width:36px;height:36px}.WDqkOq_cardIcon{object-fit:cover}.WDqkOq_cardIconFallback{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);justify-content:center;align-items:center;display:inline-flex}.WDqkOq_cardFooter{border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);flex-wrap:wrap;align-items:center;gap:8px;margin-top:auto;padding:10px 14px;display:flex}.WDqkOq_cardRow{flex-direction:row;align-items:stretch;gap:0;padding:14px}.WDqkOq_cardList{flex-direction:column;gap:10px;padding:14px;display:flex}.WDqkOq_cardListTop{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.WDqkOq_cardListLead{flex:auto;align-items:flex-start;gap:10px;min-width:0;display:flex}.WDqkOq_cardListText{flex-direction:column;flex:auto;align-items:flex-start;gap:6px;min-width:0;display:flex}.WDqkOq_cardListText .WDqkOq_cardTitleRow{justify-content:flex-start;width:100%}.WDqkOq_cardListLead .WDqkOq_cardTitle{text-overflow:ellipsis;white-space:nowrap;flex:0 auto;overflow:hidden}.WDqkOq_cardCodeInline,.WDqkOq_cardCodeList{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.35}.WDqkOq_cardCodeInline{text-overflow:ellipsis;white-space:nowrap;flex:0 auto;overflow:hidden}.WDqkOq_cardCodeList{overflow-wrap:anywhere;word-break:break-word;white-space:normal;max-width:100%}.WDqkOq_cardListLead .WDqkOq_cardMeta{flex-wrap:wrap;flex:0 auto}.WDqkOq_cardListActions{background:0 0;border-top:none;flex-wrap:nowrap;flex:none;justify-content:flex-end;align-items:center;gap:8px;margin:0;padding:0;display:flex}.WDqkOq_cardListMain{flex-direction:column;flex:1;gap:8px;min-width:0;padding-right:16px;display:flex}.WDqkOq_cardListAside{flex:none;align-items:flex-end;margin-left:auto;padding-left:16px;display:flex}.WDqkOq_cardListAside .WDqkOq_cardFooter{background:0 0;border-top:none;justify-content:flex-end;margin-top:0;padding:0}.WDqkOq_searchInput{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:180px;height:36px;color:inherit;font:inherit;border-radius:10px;flex:1;padding:0 12px}.WDqkOq_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:36px;color:inherit;font:inherit;border-radius:10px;padding:0 10px}.WDqkOq_button{background:var(--dsw-alias-interactive-bg-accent);height:36px;color:var(--dsw-alias-label-on-accent);font:inherit;cursor:pointer;border:none;border-radius:10px;padding:0 14px;font-weight:500}.WDqkOq_buttonSecondary{border:1px solid var(--dsw-alias-border-l2);height:36px;color:inherit;font:inherit;cursor:pointer;background:0 0;border-radius:10px;padding:0 14px;font-weight:500}.WDqkOq_buttonSecondary:hover{background:var(--dsw-alias-interactive-bg-hover)}.WDqkOq_button:disabled,.WDqkOq_buttonSecondary:disabled{opacity:.55;cursor:not-allowed}.WDqkOq_alertError{color:#c41e3a;background:#c41e3a14;border-radius:10px;margin:0;padding:10px 12px;font-size:13px;line-height:1.5}.WDqkOq_alertSuccess{color:var(--dsw-alias-label-primary);background:#1212f914;border-radius:10px;margin:0;padding:10px 12px;font-size:13px;line-height:1.5}.WDqkOq_cardTitle{margin:0;font-size:15px;font-weight:600;line-height:1.35}.WDqkOq_cardTitleRow{justify-content:space-between;align-items:flex-start;gap:8px;min-width:0;display:flex}.WDqkOq_cardTitleRow .WDqkOq_cardTitle{flex:auto;min-width:0}.WDqkOq_cardMeta{flex-wrap:wrap;gap:6px;display:flex}.WDqkOq_badge{border:1px solid #0000;border-radius:999px;align-items:center;padding:2px 8px;font-size:11px;font-weight:500;line-height:1.4;display:inline-flex}.WDqkOq_badgeSourceSupanexus{color:#1212f9;background:#1212f91a;border-color:#1212f92e}.WDqkOq_badgeSourceCommunity{color:#6d28d9;background:#7c3aed1a;border-color:#7c3aed2e}.WDqkOq_badgeLayerCore{color:#b45309;background:#d977061a;border-color:#d9770633}.WDqkOq_badgeLayerFeature{color:#047857;background:#0596691a;border-color:#0596692e}.WDqkOq_badgeUpgrade{color:#c2410c;background:#ea580c1f;border-color:#ea580c38}.WDqkOq_badgeVersion{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px}.WDqkOq_badgeDisabled{color:#64748b;background:#64748b1f;border-color:#64748b38}.WDqkOq_cardDisabled{opacity:.72}.WDqkOq_cardDisabled .WDqkOq_cardTitle,.WDqkOq_cardDisabled .WDqkOq_cardDesc,.WDqkOq_cardDisabled .WDqkOq_cardDescList{color:var(--dsw-alias-label-tertiary)}.WDqkOq_toggleRow{align-items:center;gap:8px;margin-right:4px;display:inline-flex}.WDqkOq_toggleLabel{color:var(--dsw-alias-label-secondary);user-select:none;font-size:12px}.WDqkOq_toggleSwitch{flex:none;align-items:center;width:36px;height:20px;display:inline-flex;position:relative}.WDqkOq_toggleSwitch input{opacity:0;cursor:pointer;width:100%;height:100%;margin:0;position:absolute;inset:0}.WDqkOq_toggleSwitch input:disabled{cursor:not-allowed}.WDqkOq_toggleTrack{background:var(--dsw-alias-border-l2);border-radius:999px;width:100%;height:100%;transition:background .15s;display:block}.WDqkOq_toggleSwitch input:checked+.WDqkOq_toggleTrack{background:#22c55e}.WDqkOq_toggleRowEnabled .WDqkOq_toggleLabel{color:#16a34a}.WDqkOq_toggleThumb{pointer-events:none;background:#fff;border-radius:50%;width:16px;height:16px;transition:transform .15s;position:absolute;top:2px;left:2px;box-shadow:0 1px 2px #0000002e}.WDqkOq_toggleSwitch input:checked~.WDqkOq_toggleThumb{transform:translate(16px)}.WDqkOq_toggleSwitch input:disabled~.WDqkOq_toggleThumb{opacity:.7}.WDqkOq_cardDesc{min-height:3rem;max-height:7.75rem;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin;flex:auto;margin:0;font-size:12px;line-height:1.55;overflow:hidden auto}.WDqkOq_cardDescList{width:100%;max-height:6rem;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin;margin:0;font-size:12px;line-height:1.55;overflow:hidden auto}.WDqkOq_cardCode{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin:4px 0 0;font-size:12px;line-height:1.35;overflow:hidden}.WDqkOq_cardFooter .WDqkOq_buttonSm,.WDqkOq_buttonSm{background:var(--dsw-alias-interactive-bg-accent);height:28px;color:var(--dsw-alias-label-on-accent);font:inherit;cursor:pointer;border:none;border-radius:8px;padding:0 10px;font-size:12px;font-weight:500}.WDqkOq_cardFooter .WDqkOq_buttonSm:disabled,.WDqkOq_buttonSm:disabled{opacity:.55;cursor:not-allowed}.WDqkOq_buttonSmDanger{color:#c41e3a;height:28px;font:inherit;cursor:pointer;background:#c41e3a14;border:1px solid #c41e3a59;border-radius:8px;padding:0 10px;font-size:12px;font-weight:500}.WDqkOq_buttonSmDanger:disabled{opacity:.55;cursor:not-allowed}.WDqkOq_buttonDanger{color:#c41e3a;height:36px;font:inherit;cursor:pointer;background:#c41e3a1a;border:1px solid #c41e3a59;border-radius:10px;padding:0 14px;font-size:14px;font-weight:500}.WDqkOq_buttonDanger:disabled{opacity:.55;cursor:not-allowed}.WDqkOq_linkButtonOutline{border:1px solid var(--dsw-alias-border-l2);height:28px;color:inherit;white-space:nowrap;background:0 0;border-radius:8px;justify-content:center;align-items:center;padding:0 10px;font-size:12px;line-height:1;text-decoration:none;display:inline-flex}.WDqkOq_linkButtonOutline:hover{background:var(--dsw-alias-bg-layer-2)}.WDqkOq_linkButtonGhost{height:28px;color:inherit;white-space:nowrap;background:0 0;border:none;border-radius:8px;justify-content:center;align-items:center;padding:0 10px;font-size:12px;line-height:1;text-decoration:none;display:inline-flex}.WDqkOq_linkButtonGhost:hover{background:var(--dsw-alias-bg-layer-2)}.WDqkOq_empty,.WDqkOq_loading{text-align:center;color:var(--dsw-alias-label-secondary);margin:0;padding:24px 0;font-size:14px}.WDqkOq_footer{flex:none;justify-content:center;padding:4px 0 20px;display:flex}.WDqkOq_installOverlay{z-index:1100;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);justify-content:center;align-items:center;padding:16px;display:flex;position:fixed;inset:0}.WDqkOq_installDialog{background:var(--dsw-alias-bg-layer-2);width:min(760px,100vw - 48px);max-height:min(85vh,720px);box-shadow:var(--dsw-shadow-lv3);border-radius:16px;flex-direction:column;gap:12px;padding:20px;display:flex}.WDqkOq_installDialogTitle{margin:0;font-size:17px;font-weight:600;line-height:1.35}.WDqkOq_installSummary{background:var(--dsw-alias-bg-layer-1);border-radius:10px;gap:8px;margin:0;padding:10px 12px;font-size:13px;display:grid}.WDqkOq_installSummary>div{align-items:baseline;gap:8px;display:flex}.WDqkOq_installSummary dt{min-width:3.5rem;color:var(--dsw-alias-label-secondary);margin:0;font-weight:500}.WDqkOq_installSummary dd{overflow-wrap:anywhere;flex:1;margin:0}.WDqkOq_installDialogStatus{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.5}.WDqkOq_installLogToggle{color:var(--dsw-alias-label-accent);font:inherit;cursor:pointer;text-underline-offset:2px;background:0 0;border:none;align-self:flex-start;padding:0;font-size:13px;text-decoration:underline}.WDqkOq_installLog{color:#e8e8e8;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin;background:#1a1a1a;border-radius:10px;flex:auto;min-height:140px;max-height:360px;margin:0;padding:10px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;line-height:1.45;overflow:auto}.WDqkOq_installDialogActions{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}.WDqkOq_installDialogHint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.45}.WDqkOq_confirmOverlay{z-index:1201;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);justify-content:center;align-items:center;padding:16px;display:flex;position:fixed;inset:0}.WDqkOq_confirmDialog{background:var(--dsw-alias-bg-layer-2);width:min(420px,100vw - 48px);box-shadow:var(--dsw-shadow-lv3);border-radius:14px;flex-direction:column;gap:12px;padding:20px;display:flex}.WDqkOq_confirmDialogTitle{margin:0;font-size:16px;font-weight:600;line-height:1.35}.WDqkOq_confirmDialogMessage{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.5}.WDqkOq_confirmDialogActions{flex-wrap:wrap;justify-content:flex-end;gap:8px;padding-top:4px;display:flex}";
		const tagId$2 = "@supanexus/dsh-plugin-supanexus-core/skill-market.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var skill_market_module_css_default = {
			"alertError": "WDqkOq_alertError",
			"alertSuccess": "WDqkOq_alertSuccess",
			"badge": "WDqkOq_badge",
			"badgeDisabled": "WDqkOq_badgeDisabled",
			"badgeLayerCore": "WDqkOq_badgeLayerCore",
			"badgeLayerFeature": "WDqkOq_badgeLayerFeature",
			"badgeSourceCommunity": "WDqkOq_badgeSourceCommunity",
			"badgeSourceSupanexus": "WDqkOq_badgeSourceSupanexus",
			"badgeUpgrade": "WDqkOq_badgeUpgrade",
			"badgeVersion": "WDqkOq_badgeVersion",
			"body": "WDqkOq_body",
			"bodyLayout": "WDqkOq_bodyLayout",
			"button": "WDqkOq_button",
			"buttonDanger": "WDqkOq_buttonDanger",
			"buttonSecondary": "WDqkOq_buttonSecondary",
			"buttonSm": "WDqkOq_buttonSm",
			"buttonSmDanger": "WDqkOq_buttonSmDanger",
			"card": "WDqkOq_card",
			"cardBody": "WDqkOq_cardBody",
			"cardCode": "WDqkOq_cardCode",
			"cardCodeInline": "WDqkOq_cardCodeInline",
			"cardCodeList": "WDqkOq_cardCodeList",
			"cardDesc": "WDqkOq_cardDesc",
			"cardDescList": "WDqkOq_cardDescList",
			"cardDisabled": "WDqkOq_cardDisabled",
			"cardFooter": "WDqkOq_cardFooter",
			"cardGrid": "WDqkOq_cardGrid",
			"cardHead": "WDqkOq_cardHead",
			"cardHeadText": "WDqkOq_cardHeadText",
			"cardIcon": "WDqkOq_cardIcon",
			"cardIconFallback": "WDqkOq_cardIconFallback",
			"cardList": "WDqkOq_cardList",
			"cardListActions": "WDqkOq_cardListActions",
			"cardListAside": "WDqkOq_cardListAside",
			"cardListLead": "WDqkOq_cardListLead",
			"cardListMain": "WDqkOq_cardListMain",
			"cardListText": "WDqkOq_cardListText",
			"cardListTop": "WDqkOq_cardListTop",
			"cardMeta": "WDqkOq_cardMeta",
			"cardRow": "WDqkOq_cardRow",
			"cardTitle": "WDqkOq_cardTitle",
			"cardTitleRow": "WDqkOq_cardTitleRow",
			"categoryNav": "WDqkOq_categoryNav",
			"categoryNavItem": "WDqkOq_categoryNavItem",
			"categoryNavItemActive": "WDqkOq_categoryNavItemActive",
			"categorySidebar": "WDqkOq_categorySidebar",
			"categorySidebarCollapsed": "WDqkOq_categorySidebarCollapsed",
			"categorySidebarHead": "WDqkOq_categorySidebarHead",
			"categorySidebarTitle": "WDqkOq_categorySidebarTitle",
			"closeButton": "WDqkOq_closeButton",
			"confirmDialog": "WDqkOq_confirmDialog",
			"confirmDialogActions": "WDqkOq_confirmDialogActions",
			"confirmDialogMessage": "WDqkOq_confirmDialogMessage",
			"confirmDialogTitle": "WDqkOq_confirmDialogTitle",
			"confirmOverlay": "WDqkOq_confirmOverlay",
			"empty": "WDqkOq_empty",
			"footer": "WDqkOq_footer",
			"grid": "WDqkOq_grid",
			"gridCols1": "WDqkOq_gridCols1",
			"gridCols3": "WDqkOq_gridCols3",
			"gridScroll": "WDqkOq_gridScroll",
			"header": "WDqkOq_header",
			"headerActions": "WDqkOq_headerActions",
			"headerLink": "WDqkOq_headerLink",
			"installDialog": "WDqkOq_installDialog",
			"installDialogActions": "WDqkOq_installDialogActions",
			"installDialogHint": "WDqkOq_installDialogHint",
			"installDialogStatus": "WDqkOq_installDialogStatus",
			"installDialogTitle": "WDqkOq_installDialogTitle",
			"installLog": "WDqkOq_installLog",
			"installLogToggle": "WDqkOq_installLogToggle",
			"installOverlay": "WDqkOq_installOverlay",
			"installSummary": "WDqkOq_installSummary",
			"layer": "WDqkOq_layer",
			"linkButtonGhost": "WDqkOq_linkButtonGhost",
			"linkButtonOutline": "WDqkOq_linkButtonOutline",
			"loading": "WDqkOq_loading",
			"mainContent": "WDqkOq_mainContent",
			"mask": "WDqkOq_mask",
			"overlay": "WDqkOq_overlay",
			"panel": "WDqkOq_panel",
			"rail": "WDqkOq_rail",
			"searchInput": "WDqkOq_searchInput",
			"segmentButton": "WDqkOq_segmentButton",
			"segmentButtonActive": "WDqkOq_segmentButtonActive",
			"segmentButtonCompact": "WDqkOq_segmentButtonCompact",
			"segmentButtonIcon": "WDqkOq_segmentButtonIcon",
			"segmentGroup": "WDqkOq_segmentGroup",
			"segmentGroupEnd": "WDqkOq_segmentGroupEnd",
			"select": "WDqkOq_select",
			"sidebarToggle": "WDqkOq_sidebarToggle",
			"subtitle": "WDqkOq_subtitle",
			"tabBar": "WDqkOq_tabBar",
			"title": "WDqkOq_title",
			"titleBlock": "WDqkOq_titleBlock",
			"toggleLabel": "WDqkOq_toggleLabel",
			"toggleRow": "WDqkOq_toggleRow",
			"toggleRowEnabled": "WDqkOq_toggleRowEnabled",
			"toggleSwitch": "WDqkOq_toggleSwitch",
			"toggleThumb": "WDqkOq_toggleThumb",
			"toggleTrack": "WDqkOq_toggleTrack",
			"toolbar": "WDqkOq_toolbar",
			"trigger": "WDqkOq_trigger",
			"triggerLabel": "WDqkOq_triggerLabel"
		};
		//#endregion
		//#region lib/types/client/skill-market/PluginListingIcon.js
		function PluginListingIcon({ url, name }) {
			const [failed, setFailed] = (0, react.useState)(false);
			const iconUrl = url?.trim();
			if (iconUrl === void 0 || iconUrl.length === 0 || failed) return (0, react_jsx_runtime.jsx)("span", {
				className: skill_market_module_css_default.cardIconFallback,
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 24 24",
					width: "16",
					height: "16",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					children: [
						(0, react_jsx_runtime.jsx)("path", { d: "M12 2 2 7l10 5 10-5-10-5Z" }),
						(0, react_jsx_runtime.jsx)("path", { d: "m2 17 10 5 10-5" }),
						(0, react_jsx_runtime.jsx)("path", { d: "m2 12 10 5 10-5" })
					]
				})
			});
			return (0, react_jsx_runtime.jsx)("img", {
				src: iconUrl,
				alt: name,
				className: skill_market_module_css_default.cardIcon,
				onError: () => {
					setFailed(true);
				}
			});
		}
		//#endregion
		//#region lib/types/client/skill-market/ListingCard.js
		function PluginToggleSwitch({ item, state }) {
			const { t, togglingPackage, isOperating, hasOperationModal, canToggle, getToggleStatus, onToggle } = state;
			const toggleStatus = getToggleStatus(item);
			if (!canToggle(item) || (toggleStatus?.row_ids?.length ?? 0) === 0) return null;
			const enabled = toggleStatus?.enabled !== false;
			const busy = togglingPackage === item.package_name || isOperating || hasOperationModal;
			return (0, react_jsx_runtime.jsxs)("label", {
				className: `${skill_market_module_css_default.toggleRow}${enabled ? ` ${skill_market_module_css_default.toggleRowEnabled}` : ""}`,
				title: enabled ? t("pluginEnabled") : t("pluginDisabled"),
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: skill_market_module_css_default.toggleLabel,
					children: enabled ? t("pluginEnabled") : t("pluginDisabled")
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: skill_market_module_css_default.toggleSwitch,
					children: [
						(0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: enabled,
							disabled: busy,
							"aria-label": enabled ? t("toggleDisable") : t("toggleEnable"),
							onChange: (event) => {
								onToggle(item, event.target.checked);
							}
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: skill_market_module_css_default.toggleTrack,
							"aria-hidden": "true"
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: skill_market_module_css_default.toggleThumb,
							"aria-hidden": "true"
						})
					]
				})]
			});
		}
		function CardActions({ item, state, docs, homepage, className }) {
			const { t, installingCode, uninstallingCode, isOperating, hasOperationModal, isInstalled, canUninstall, getUpgradeStatus, onInstall, onUpgrade, onUninstall } = state;
			const installed = isInstalled(item);
			const upgradeStatus = getUpgradeStatus(item);
			const upgradeable = installed && upgradeStatus?.upgradeable === true;
			const installBusy = installingCode === item.install_code;
			const uninstallBusy = uninstallingCode === item.install_code;
			const operationBusy = isOperating || hasOperationModal;
			const showUninstall = installed && canUninstall(item);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: className ?? skill_market_module_css_default.cardFooter,
				children: [
					installed ? (0, react_jsx_runtime.jsx)(PluginToggleSwitch, {
						item,
						state
					}) : null,
					upgradeable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: skill_market_module_css_default.buttonSm,
						disabled: operationBusy,
						onClick: () => {
							onUpgrade(item);
						},
						children: installBusy ? t("upgrading") : upgradeStatus?.listing_version !== null && upgradeStatus?.listing_version !== void 0 ? t("upgradeTo").replace("{version}", upgradeStatus.listing_version) : item.version !== void 0 && item.version !== null && item.version.length > 0 ? t("upgradeTo").replace("{version}", item.version) : t("upgrade")
					}) : null,
					showUninstall ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: skill_market_module_css_default.buttonSmDanger,
						disabled: operationBusy,
						onClick: () => {
							onUninstall(item);
						},
						children: uninstallBusy ? t("uninstalling") : t("uninstall")
					}) : !upgradeable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: skill_market_module_css_default.buttonSm,
						disabled: installed || operationBusy,
						onClick: () => {
							onInstall(item);
						},
						children: installBusy ? t("installing") : installed ? t("installed") : operationBusy ? t("installWait") : t("install")
					}) : null,
					docs !== void 0 && docs.length > 0 && (0, react_jsx_runtime.jsx)("a", {
						className: skill_market_module_css_default.linkButtonGhost,
						href: docs,
						target: "_blank",
						rel: "noreferrer",
						children: t("openDocs")
					}),
					homepage !== void 0 && homepage.length > 0 && homepage !== docs && (0, react_jsx_runtime.jsx)("a", {
						className: skill_market_module_css_default.linkButtonGhost,
						href: homepage,
						target: "_blank",
						rel: "noreferrer",
						children: t("openHomepage")
					})
				]
			});
		}
		function CardDescription({ text, className }) {
			const value = text.trim();
			return (0, react_jsx_runtime.jsx)("p", {
				className: className ?? "",
				title: value,
				children: value
			});
		}
		function CardTitleRow({ item, version }) {
			const label = version?.trim();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: skill_market_module_css_default.cardTitleRow,
				children: [(0, react_jsx_runtime.jsx)("h3", {
					className: skill_market_module_css_default.cardTitle,
					children: item.name
				}), label !== void 0 && label.length > 0 ? (0, react_jsx_runtime.jsxs)("span", {
					className: `${skill_market_module_css_default.badge} ${skill_market_module_css_default.badgeVersion}`,
					children: ["v", label]
				}) : null]
			});
		}
		function resolveCardVersion(item, installed, installedVersion) {
			if (installed) return installedVersion?.trim() || null;
			return item.version?.trim() || null;
		}
		function CardMeta({ item, t, upgradeable, disabled }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: skill_market_module_css_default.cardMeta,
				children: [
					disabled ? (0, react_jsx_runtime.jsx)("span", {
						className: `${skill_market_module_css_default.badge} ${skill_market_module_css_default.badgeDisabled}`,
						children: t("pluginDisabled")
					}) : null,
					upgradeable ? (0, react_jsx_runtime.jsx)("span", {
						className: `${skill_market_module_css_default.badge} ${skill_market_module_css_default.badgeUpgrade}`,
						children: t("upgradeAvailable")
					}) : null,
					(0, react_jsx_runtime.jsx)("span", {
						className: `${skill_market_module_css_default.badge} ${item.source === "supanexus" ? skill_market_module_css_default.badgeSourceSupanexus : skill_market_module_css_default.badgeSourceCommunity}`,
						children: item.source === "supanexus" ? t("sourceSupanexus") : t("sourceCommunity")
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: `${skill_market_module_css_default.badge} ${item.layer === "core" ? skill_market_module_css_default.badgeLayerCore : skill_market_module_css_default.badgeLayerFeature}`,
						children: item.layer === "core" ? t("layerCore") : t("layerFeature")
					})
				]
			});
		}
		function CardBody({ item, t, upgradeable, disabled, version }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: skill_market_module_css_default.cardHead,
					children: [(0, react_jsx_runtime.jsx)(PluginListingIcon, {
						url: item.icon_url,
						name: item.name
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: skill_market_module_css_default.cardHeadText,
						children: [(0, react_jsx_runtime.jsx)(CardTitleRow, {
							item,
							version
						}), (0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.cardCode,
							title: item.package_name,
							children: item.package_name
						})]
					})]
				}),
				(0, react_jsx_runtime.jsx)(CardMeta, {
					item,
					t,
					upgradeable,
					disabled
				}),
				(0, react_jsx_runtime.jsx)(CardDescription, {
					text: item.description ?? "",
					className: skill_market_module_css_default.cardDesc
				})
			] });
		}
		function ListingCard({ item, state, layout }) {
			const { t, isInstalled, getUpgradeStatus, getToggleStatus } = state;
			const docs = item.docs_url?.trim();
			const homepage = item.homepage_url?.trim();
			const isList = layout === "cols1";
			const actionProps = {
				item,
				state,
				docs,
				homepage
			};
			const installed = isInstalled(item);
			const upgradeStatus = getUpgradeStatus(item);
			const upgradeable = installed && upgradeStatus?.upgradeable === true;
			const toggleStatus = getToggleStatus(item);
			const pluginDisabled = installed && toggleStatus?.enabled === false;
			const cardVersion = resolveCardVersion(item, installed, upgradeStatus?.installed_version);
			const cardClass = `${skill_market_module_css_default.card} ${isList ? skill_market_module_css_default.cardList : skill_market_module_css_default.cardGrid}${pluginDisabled ? ` ${skill_market_module_css_default.cardDisabled}` : ""}`;
			if (isList) return (0, react_jsx_runtime.jsxs)("article", {
				className: cardClass,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: skill_market_module_css_default.cardListTop,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: skill_market_module_css_default.cardListLead,
						children: [(0, react_jsx_runtime.jsx)(PluginListingIcon, {
							url: item.icon_url,
							name: item.name
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.cardListText,
							children: [
								(0, react_jsx_runtime.jsx)(CardTitleRow, {
									item,
									version: cardVersion
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: skill_market_module_css_default.cardCodeList,
									title: item.package_name,
									children: item.package_name
								}),
								(0, react_jsx_runtime.jsx)(CardMeta, {
									item,
									t,
									upgradeable,
									disabled: pluginDisabled
								})
							]
						})]
					}), (0, react_jsx_runtime.jsx)(CardActions, {
						...actionProps,
						className: skill_market_module_css_default.cardListActions
					})]
				}), (0, react_jsx_runtime.jsx)(CardDescription, {
					text: item.description ?? "",
					className: skill_market_module_css_default.cardDescList
				})]
			});
			return (0, react_jsx_runtime.jsxs)("article", {
				className: cardClass,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: skill_market_module_css_default.cardBody,
					children: (0, react_jsx_runtime.jsx)(CardBody, {
						item,
						t,
						upgradeable,
						disabled: pluginDisabled,
						version: cardVersion
					})
				}), (0, react_jsx_runtime.jsx)(CardActions, { ...actionProps })]
			});
		}
		//#endregion
		//#region lib/types/shared/plugin-market-contract.js
		/** Plugin plaza (skill market) shared contract — types, paths, install spec helpers. */
		const PLUGIN_LISTINGS_PATH = "/api/supanexus.plugin-listings";
		const PLUGIN_CATEGORIES_PATH = "/api/supanexus.plugin-categories";
		/** GET with `?installCode=` — connection.fetch only supports GET/HEAD. */
		const PLUGIN_INSTALL_PATH = "/api/supanexus.plugin-install";
		/** GET — loopback-only Host relaunch for web / local dsh web. */
		const RESTART_HOST_PATH = "/api/supanexus.restart-host";
		/** GET with `?packageName=` — remove an installed plugin from the profile. */
		const PLUGIN_UNINSTALL_PATH = "/api/supanexus.plugin-uninstall";
		/** GET with `?installCodes=` — batch upgrade hints for installed plugins. */
		const PLUGIN_UPGRADE_STATUS_PATH = "/api/supanexus.plugin-upgrade-status";
		/** GET with `?installCode=` — fetch remote package.json version at operational ref. */
		const PLUGIN_REMOTE_VERSION_PATH = "/api/supanexus.plugin-remote-version";
		/** GET with `?packageNames=` — batch enabled/disabled state from user patch layer. */
		const PLUGIN_TOGGLE_STATUS_PATH = "/api/supanexus.plugin-toggle-status";
		/** GET with `?packageName=&enabled=` — enable/disable via cordis.patch.yml. */
		const PLUGIN_TOGGLE_PATH = "/api/supanexus.plugin-toggle";
		function formatInstallAttemptsLog(attempts) {
			const blocks = [];
			for (const attempt of attempts) {
				const lines = [`[${attempt.provider}] ${attempt.cliCommand ?? attempt.spec}`];
				if (attempt.stdout !== void 0 && attempt.stdout.trim().length > 0) lines.push(attempt.stdout.trimEnd());
				if (attempt.stderr !== void 0 && attempt.stderr.trim().length > 0) lines.push(attempt.stderr.trimEnd());
				if (!attempt.ok && attempt.message !== void 0 && attempt.message.length > 0) lines.push(attempt.message);
				blocks.push(lines.join("\n"));
			}
			return blocks.join("\n\n");
		}
		/** Whether skill market may offer uninstall for this listing. */
		function canUninstallPlugin(item) {
			if (item.install_code === "supanexus-core") return false;
			if (item.package_name === "@supanexus/dsh-plugin-supanexus-core") return false;
			return !item.package_name.endsWith("dsh-plugin-supanexus-core");
		}
		/** Whether skill market may offer enable/disable for this listing. */
		function canTogglePlugin(item) {
			return canUninstallPlugin(item);
		}
		//#endregion
		//#region lib/types/client/skill-market/install-error.js
		var InstallPluginError = class extends Error {
			attempts;
			log;
			constructor(message, options) {
				super(message);
				this.name = "InstallPluginError";
				if (options?.attempts !== void 0) this.attempts = options.attempts;
				if (options?.log !== void 0) this.log = options.log;
			}
		};
		//#endregion
		//#region lib/types/client/skill-market/wire.js
		/** Browser fetch wrappers for plugin market Host API routes. */
		async function readResponseBody$1(response) {
			if ((response.headers.get("content-type") ?? "").includes("application/json")) return response.json();
			const text = await response.text();
			if (text.length === 0) return {};
			try {
				return JSON.parse(text);
			} catch {
				return { message: text };
			}
		}
		async function parseJson$1(response) {
			const body = await readResponseBody$1(response);
			if (!response.ok || body.ok === false) {
				if (response.status === 404) throw new Error(typeof body.message === "string" && body.message.length > 0 ? body.message : "HOST_API_NOT_FOUND");
				const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
				throw new Error(message);
			}
			return body;
		}
		/** List published plugins via Host proxy. */
		async function listPluginListings(params) {
			const url = new URL(PLUGIN_LISTINGS_PATH, window.location.origin);
			if (params?.locale !== void 0) url.searchParams.set("locale", params.locale);
			if (params?.source !== void 0 && params.source.length > 0) url.searchParams.set("source", params.source);
			if (params?.layer !== void 0 && params.layer.length > 0) url.searchParams.set("layer", params.layer);
			if (params?.category !== void 0 && params.category.length > 0) url.searchParams.set("category", params.category);
			if (params?.q !== void 0 && params.q.length > 0) url.searchParams.set("q", params.q);
			const page = params?.page != null && params.page > 0 ? Math.floor(params.page) : 1;
			const pageSize = params?.page_size != null && params.page_size > 0 ? Math.min(50, Math.floor(params.page_size)) : 12;
			url.searchParams.set("page", String(page));
			url.searchParams.set("page_size", String(pageSize));
			const body = await parseJson$1(await fetch(url));
			return {
				items: body.items ?? [],
				total_count: body.total_count ?? 0,
				page: body.page ?? page,
				page_size: body.page_size ?? pageSize,
				has_next_page: !!body.has_next_page
			};
		}
		/** List plugin categories via Host proxy. */
		async function listPluginCategories(params) {
			const url = new URL(PLUGIN_CATEGORIES_PATH, window.location.origin);
			if (params?.locale !== void 0) url.searchParams.set("locale", params.locale);
			return { items: (await parseJson$1(await fetch(url))).items ?? [] };
		}
		/** Install a plugin by install code via Host bridge (GET; connection.fetch is GET-only). */
		async function installPlugin(installCode, locale) {
			const url = new URL(PLUGIN_INSTALL_PATH, window.location.origin);
			url.searchParams.set("installCode", installCode);
			if (locale !== void 0 && locale.length > 0) url.searchParams.set("locale", locale);
			const response = await fetch(url);
			const body = await readResponseBody$1(response);
			const failureMessage = "message" in body && typeof body.message === "string" && body.message.length > 0 ? body.message : void 0;
			if (!response.ok || body.ok === false) {
				if (response.status === 404) throw new InstallPluginError(failureMessage ?? "HOST_API_NOT_FOUND");
				const message = failureMessage ?? `HTTP ${String(response.status)}`;
				const attempts = body.attempts;
				const log = typeof body.log === "string" && body.log.length > 0 ? body.log : attempts !== void 0 ? formatInstallAttemptsLog(attempts) : void 0;
				throw new InstallPluginError(message, {
					...attempts !== void 0 ? { attempts } : {},
					...log !== void 0 ? { log } : {}
				});
			}
			const log = body.attempts !== void 0 ? formatInstallAttemptsLog(body.attempts) : void 0;
			const success = body;
			return log !== void 0 ? {
				...success,
				log
			} : success;
		}
		/** Uninstall a plugin by package name via Host bridge. */
		async function uninstallPlugin(packageName, installCode) {
			const url = new URL(PLUGIN_UNINSTALL_PATH, window.location.origin);
			url.searchParams.set("packageName", packageName);
			if (installCode !== void 0 && installCode.length > 0) url.searchParams.set("installCode", installCode);
			const response = await fetch(url);
			const body = await readResponseBody$1(response);
			const failureMessage = "message" in body && typeof body.message === "string" && body.message.length > 0 ? body.message : void 0;
			if (!response.ok || body.ok === false) {
				if (response.status === 404) throw new InstallPluginError(failureMessage ?? "HOST_API_NOT_FOUND");
				const message = failureMessage ?? `HTTP ${String(response.status)}`;
				const log = typeof body.log === "string" && body.log.length > 0 ? body.log : void 0;
				throw new InstallPluginError(message, { ...log !== void 0 ? { log } : {} });
			}
			const log = typeof body.log === "string" && body.log.length > 0 ? body.log : void 0;
			const success = body;
			return log !== void 0 ? {
				...success,
				log
			} : success;
		}
		/** Batch upgrade hints for installed plugins via Host bridge. */
		async function fetchPluginUpgradeStatus(installCodes, locale) {
			const url = new URL(PLUGIN_UPGRADE_STATUS_PATH, window.location.origin);
			url.searchParams.set("installCodes", installCodes.join(","));
			if (locale !== void 0 && locale.length > 0) url.searchParams.set("locale", locale);
			return { items: (await parseJson$1(await fetch(url))).items ?? [] };
		}
		/** Fetch remote package.json version for upgrade confirm. */
		async function fetchPluginRemoteVersion(installCode, locale) {
			const url = new URL(PLUGIN_REMOTE_VERSION_PATH, window.location.origin);
			url.searchParams.set("installCode", installCode);
			if (locale !== void 0 && locale.length > 0) url.searchParams.set("locale", locale);
			const body = await parseJson$1(await fetch(url));
			return {
				version: body.version ?? null,
				provider: body.provider ?? null
			};
		}
		/** Batch enabled/disabled state for installed plugins. */
		async function fetchPluginToggleStatus(packageNames) {
			const url = new URL(PLUGIN_TOGGLE_STATUS_PATH, window.location.origin);
			url.searchParams.set("packageNames", packageNames.join(","));
			return { items: (await parseJson$1(await fetch(url))).items ?? [] };
		}
		/** Toggle one installed plugin via profile cordis.patch.yml. */
		async function setPluginEnabled(packageName, enabled) {
			const url = new URL(PLUGIN_TOGGLE_PATH, window.location.origin);
			url.searchParams.set("packageName", packageName);
			url.searchParams.set("enabled", enabled ? "true" : "false");
			const body = await parseJson$1(await fetch(url));
			return {
				package_name: body.package_name ?? packageName,
				enabled: body.enabled ?? enabled,
				row_ids: body.row_ids ?? [],
				needsRefresh: body.needsRefresh ?? true
			};
		}
		/** Restart dsh web Host via loopback API (web profile). */
		async function restartHostService() {
			const fallback = new URL(PLUGIN_INSTALL_PATH, window.location.origin);
			fallback.searchParams.set("action", "restart");
			const candidates = [new URL(RESTART_HOST_PATH, window.location.origin), fallback];
			let sawMissingApi = false;
			for (const url of candidates) {
				const response = await fetch(url);
				const body = await readResponseBody$1(response);
				if (response.ok && body.ok !== false) return;
				const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
				if (response.status === 404 || message === "not found" || message === "HOST_API_NOT_FOUND") {
					sawMissingApi = true;
					continue;
				}
				throw new Error(message);
			}
			throw new Error(sawMissingApi ? "HOST_RESTART_API_MISSING" : "重启失败");
		}
		//#endregion
		//#region lib/types/client/skill-market/desktop-bridge.js
		/** Desktop shell bridge + web Host restart API. */
		/** Whether the Electron shell exposes restartHost. */
		function canRestartHost() {
			return typeof window.whaleDesktop?.restartHost === "function";
		}
		/** Request host restart when running inside the Desktop shell. */
		async function requestHostRestart() {
			const restart = window.whaleDesktop?.restartHost;
			if (typeof restart !== "function") return false;
			await restart();
			return true;
		}
		/** Desktop shell or loopback web Host restart is available. */
		function canRequestServiceRestart() {
			return canRestartHost() || isLoopbackBrowserOrigin();
		}
		function isLoopbackBrowserOrigin() {
			if (typeof window === "undefined") return false;
			const host = window.location.hostname.toLowerCase();
			return host === "127.0.0.1" || host === "localhost" || host === "::1";
		}
		/**
		* Restart Host: Desktop bridge first, otherwise loopback restart API.
		* The web API ends the current process after spawning a detached replacement.
		*/
		async function requestServiceRestart() {
			if (canRestartHost()) return requestHostRestart();
			await restartHostService();
			return true;
		}
		//#endregion
		//#region lib/types/client/skill-market/InstallProgressModal.js
		function InstallProgressModal({ progress, t, onClose, onStartInstall, onStartUpgrade, onStartUninstall, onToggleLog }) {
			const logRef = (0, react.useRef)(null);
			const [confirmRestart, setConfirmRestart] = (0, react.useState)(false);
			const [restarting, setRestarting] = (0, react.useState)(false);
			const [restartError, setRestartError] = (0, react.useState)();
			const { item, phase, log, showLog, operation, targetVersion, remoteVersion } = progress;
			const isUninstall = operation === "uninstall";
			const isUpgrade = operation === "upgrade";
			const confirming = phase === "confirm";
			const running = phase === "running";
			const checkingRemoteVersion = isUpgrade && running && log.length === 0;
			const success = phase === "success";
			const failed = phase === "error";
			const showRestart = success && canRequestServiceRestart() && !restarting;
			const modalTitle = restarting ? t("restartServiceWorking") : confirming ? isUninstall ? t("uninstallModalTitleConfirm") : isUpgrade ? t("upgradeModalTitleConfirm") : t("installModalTitleConfirm") : running ? isUninstall ? t("uninstallModalTitleRunning") : isUpgrade ? t("upgradeModalTitleRunning") : t("installModalTitleRunning") : success ? isUninstall ? t("uninstallModalTitleSuccess") : isUpgrade ? t("upgradeModalTitleSuccess") : t("installModalTitleSuccess") : isUninstall ? t("uninstallModalTitleFailed") : isUpgrade ? t("upgradeModalTitleFailed") : t("installModalTitleFailed");
			const upgradeConfirmHint = targetVersion !== void 0 && targetVersion.length > 0 ? t("upgradeModalConfirmHintVersion").replace("{version}", targetVersion) : t("upgradeModalConfirmHint");
			const modalStatus = restarting ? t("restartServiceWorkingHint") : checkingRemoteVersion ? t("checkingRemoteVersion") : confirming ? isUninstall ? t("uninstallModalConfirmHint") : isUpgrade ? upgradeConfirmHint : t("installModalConfirmHint") : running ? isUninstall ? t("uninstallModalRunning") : isUpgrade ? checkingRemoteVersion ? t("checkingRemoteVersion") : t("upgradeModalRunning") : t("installModalRunning") : success ? isUninstall ? t("uninstallOk") : isUpgrade ? targetVersion !== void 0 && targetVersion.length > 0 ? t("upgradeOkVersion").replace("{version}", targetVersion) : t("upgradeOk") : t("installOkVia").replace("{provider}", progress.provider ?? "") : progress.errorMessage ?? (isUninstall ? t("uninstallFailed") : isUpgrade ? t("upgradeFailed") : t("installFailed"));
			const runningLogPlaceholder = isUninstall ? t("uninstallModalRunning") : isUpgrade ? t("upgradeModalRunning") : t("installModalRunning");
			const onRestart = (0, react.useCallback)(async () => {
				setConfirmRestart(false);
				setRestarting(true);
				setRestartError(void 0);
				try {
					await requestServiceRestart();
					window.setTimeout(() => {
						window.location.reload();
					}, 4e3);
				} catch (error) {
					setRestarting(false);
					const raw = error instanceof Error ? error.message : t("restartServiceFailed");
					const message = raw === "HOST_RESTART_API_MISSING" ? t("restartApiMissing") : raw;
					setRestartError(message);
				}
			}, [t]);
			(0, react.useEffect)(() => {
				if (!showLog || logRef.current === null) return;
				logRef.current.scrollTop = logRef.current.scrollHeight;
			}, [
				log,
				showLog,
				phase
			]);
			(0, react.useEffect)(() => {
				if (!confirmRestart) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") setConfirmRestart(false);
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [confirmRestart]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
				className: skill_market_module_css_default.installOverlay,
				role: "presentation",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: skill_market_module_css_default.installDialog,
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "skill-market-install-title",
					children: [
						(0, react_jsx_runtime.jsx)("h3", {
							className: skill_market_module_css_default.installDialogTitle,
							id: "skill-market-install-title",
							children: modalTitle
						}),
						(0, react_jsx_runtime.jsx)(PluginSummary, {
							item,
							t,
							...targetVersion !== void 0 && targetVersion.length > 0 ? { targetVersion } : {},
							...remoteVersion !== void 0 && remoteVersion.length > 0 ? { remoteVersion } : confirming && isUpgrade ? { remoteVersionUnknown: true } : {}
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.installDialogStatus,
							children: modalStatus
						}),
						log.length > 0 || running && !checkingRemoteVersion ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [!running && log.length > 0 ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: skill_market_module_css_default.installLogToggle,
							onClick: onToggleLog,
							children: showLog ? t("installModalHideLog") : t("installModalShowLog")
						}) : null, showLog || running ? (0, react_jsx_runtime.jsx)("pre", {
							ref: logRef,
							className: skill_market_module_css_default.installLog,
							children: log.length > 0 ? log : runningLogPlaceholder
						}) : null] }) : null,
						restartError !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.alertError,
							role: "alert",
							children: restartError
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.installDialogActions,
							children: [
								confirming ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: isUninstall ? skill_market_module_css_default.buttonDanger : skill_market_module_css_default.button,
									onClick: isUninstall ? onStartUninstall : isUpgrade ? onStartUpgrade : onStartInstall,
									children: isUninstall ? t("uninstallModalStart") : isUpgrade ? t("upgradeModalStart") : t("installModalStart")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: skill_market_module_css_default.buttonSecondary,
									onClick: onClose,
									children: t("installModalCancel")
								})] }) : null,
								!confirming && showRestart ? (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: skill_market_module_css_default.button,
									disabled: confirmRestart,
									onClick: () => {
										setConfirmRestart(true);
									},
									children: t("restartService")
								}) : null,
								!confirming ? (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: skill_market_module_css_default.buttonSecondary,
									disabled: running || restarting,
									onClick: onClose,
									children: restarting ? t("restartServiceWorkingButton") : running ? isUninstall ? t("uninstalling") : isUpgrade ? t("upgrading") : t("installModalWorking") : t("installModalClose")
								}) : null
							]
						}),
						success && showRestart && !confirmRestart && !restarting ? (0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.installDialogHint,
							children: t("restartServiceHint")
						}) : null,
						success && !canRequestServiceRestart() ? (0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.installDialogHint,
							children: t("restartHint")
						}) : null,
						failed ? (0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.installDialogHint,
							children: t("installModalFailedHint")
						}) : null
					]
				})
			}), confirmRestart && !restarting ? (0, react_jsx_runtime.jsx)(RestartConfirmDialog, {
				t,
				onConfirm: () => {
					onRestart();
				},
				onCancel: () => {
					setConfirmRestart(false);
				}
			}) : null] });
		}
		function RestartConfirmDialog({ t, onConfirm, onCancel }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: skill_market_module_css_default.confirmOverlay,
				role: "presentation",
				onClick: (event) => {
					if (event.target === event.currentTarget) onCancel();
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: skill_market_module_css_default.confirmDialog,
					role: "alertdialog",
					"aria-modal": "true",
					"aria-labelledby": "skill-market-restart-confirm-title",
					"aria-describedby": "skill-market-restart-confirm-message",
					children: [
						(0, react_jsx_runtime.jsx)("h4", {
							className: skill_market_module_css_default.confirmDialogTitle,
							id: "skill-market-restart-confirm-title",
							children: t("restartServiceConfirmTitle")
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: skill_market_module_css_default.confirmDialogMessage,
							id: "skill-market-restart-confirm-message",
							children: t("restartServiceConfirm")
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.confirmDialogActions,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: skill_market_module_css_default.button,
								onClick: onConfirm,
								children: t("restartServiceConfirmAction")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: skill_market_module_css_default.buttonSecondary,
								onClick: onCancel,
								children: t("restartServiceCancel")
							})]
						})
					]
				})
			});
		}
		function PluginSummary({ item, t, targetVersion, remoteVersion, remoteVersionUnknown }) {
			return (0, react_jsx_runtime.jsxs)("dl", {
				className: skill_market_module_css_default.installSummary,
				children: [
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("installModalPlugin") }), (0, react_jsx_runtime.jsx)("dd", { children: item.name })] }),
					(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("installModalPackage") }), (0, react_jsx_runtime.jsx)("dd", { children: item.package_name })] }),
					targetVersion !== void 0 && targetVersion.length > 0 ? (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("upgradeModalTargetVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: targetVersion })] }) : null,
					remoteVersion !== void 0 && remoteVersion.length > 0 ? (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("upgradeModalRemoteVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: remoteVersion })] }) : remoteVersionUnknown === true ? (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("upgradeModalRemoteVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: t("remoteVersionUnknown") })] }) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/skill-market/LayoutIcons.js
		function GridCols3Icon({ size = 16 }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "3",
						width: "3",
						height: "10",
						rx: "0.8",
						fill: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "6.5",
						y: "3",
						width: "3",
						height: "10",
						rx: "0.8",
						fill: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "11",
						y: "3",
						width: "3",
						height: "10",
						rx: "0.8",
						fill: "currentColor"
					})
				]
			});
		}
		function ListCol1Icon({ size = 16 }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "3",
						width: "12",
						height: "2.6",
						rx: "0.6",
						fill: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "6.7",
						width: "12",
						height: "2.6",
						rx: "0.6",
						fill: "currentColor"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "10.4",
						width: "12",
						height: "2.6",
						rx: "0.6",
						fill: "currentColor"
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/skill-market/SkillMarketPanel.js
		const DSH_PLUGIN_GITHUB_TOPIC_URL = "https://github.com/topics/dsh-plugin";
		function SkillMarketPanel({ state, onClose, officialSiteUrl }) {
			const { t, loading, items, hasNext, keyword, setKeyword, source, setSource, layer, setLayer, category, setCategory, categories, error, installProgress, closeInstallProgress, startInstall, startUpgrade, startUninstall, toggleInstallLog, onSearch, loadMore, isInstalled, installTab, setInstallTab } = state;
			const [layout, setLayout] = (0, react.useState)("cols3");
			const [categorySidebarOpen, setCategorySidebarOpen] = (0, react.useState)(true);
			const visibleItems = (0, react.useMemo)(() => items.filter((item) => installTab === "installed" ? isInstalled(item) : !isInstalled(item)), [
				items,
				installTab,
				isInstalled
			]);
			const emptyMessage = installTab === "installed" ? t("emptyInstalled") : t("emptyNotInstalled");
			return (0, react_jsx_runtime.jsxs)("div", {
				className: skill_market_module_css_default.panel,
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "skill-market-title",
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: skill_market_module_css_default.header,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.titleBlock,
							children: [(0, react_jsx_runtime.jsx)("h2", {
								className: skill_market_module_css_default.title,
								id: "skill-market-title",
								children: t("title")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: skill_market_module_css_default.subtitle,
								children: t("subtitle")
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.headerActions,
							children: [
								(0, react_jsx_runtime.jsx)("a", {
									className: skill_market_module_css_default.headerLink,
									href: officialSiteUrl,
									target: "_blank",
									rel: "noreferrer",
									children: t("officialSite")
								}),
								(0, react_jsx_runtime.jsx)("a", {
									className: skill_market_module_css_default.headerLink,
									href: DSH_PLUGIN_GITHUB_TOPIC_URL,
									target: "_blank",
									rel: "noreferrer",
									children: t("githubPlugins")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: skill_market_module_css_default.closeButton,
									"aria-label": t("close"),
									onClick: onClose,
									children: "×"
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: skill_market_module_css_default.body,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: skill_market_module_css_default.bodyLayout,
							children: [(0, react_jsx_runtime.jsxs)("aside", {
								className: `${skill_market_module_css_default.categorySidebar} ${categorySidebarOpen ? "" : skill_market_module_css_default.categorySidebarCollapsed}`,
								"aria-label": t("categoryNavTitle"),
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: skill_market_module_css_default.categorySidebarHead,
									children: [categorySidebarOpen ? (0, react_jsx_runtime.jsx)("span", {
										className: skill_market_module_css_default.categorySidebarTitle,
										children: t("categoryNavTitle")
									}) : null, (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: skill_market_module_css_default.sidebarToggle,
										"aria-label": categorySidebarOpen ? t("collapseCategories") : t("expandCategories"),
										"aria-expanded": categorySidebarOpen,
										onClick: () => {
											setCategorySidebarOpen((open) => !open);
										},
										children: categorySidebarOpen ? "‹" : "›"
									})]
								}), categorySidebarOpen ? (0, react_jsx_runtime.jsxs)("nav", {
									className: skill_market_module_css_default.categoryNav,
									"aria-label": t("categoryNavTitle"),
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${skill_market_module_css_default.categoryNavItem} ${category === "all" ? skill_market_module_css_default.categoryNavItemActive : ""}`,
										"aria-current": category === "all" ? "true" : void 0,
										onClick: () => {
											setCategory("all");
										},
										children: t("categoryAll")
									}), categories.map((c) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${skill_market_module_css_default.categoryNavItem} ${category === c.slug ? skill_market_module_css_default.categoryNavItemActive : ""}`,
										"aria-current": category === c.slug ? "true" : void 0,
										onClick: () => {
											setCategory(c.slug);
										},
										children: c.name || c.slug
									}, c.id))]
								}) : null]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: skill_market_module_css_default.mainContent,
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: skill_market_module_css_default.tabBar,
										children: (0, react_jsx_runtime.jsxs)("div", {
											className: skill_market_module_css_default.segmentGroup,
											role: "tablist",
											"aria-label": t("title"),
											children: [(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												role: "tab",
												"aria-selected": installTab === "not_installed",
												className: installTab === "not_installed" ? skill_market_module_css_default.segmentButtonActive : skill_market_module_css_default.segmentButton,
												onClick: () => {
													setInstallTab("not_installed");
												},
												children: t("tabNotInstalled")
											}), (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												role: "tab",
												"aria-selected": installTab === "installed",
												className: installTab === "installed" ? skill_market_module_css_default.segmentButtonActive : skill_market_module_css_default.segmentButton,
												onClick: () => {
													setInstallTab("installed");
												},
												children: t("tabInstalled")
											})]
										})
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: skill_market_module_css_default.toolbar,
										children: [
											(0, react_jsx_runtime.jsxs)("select", {
												className: skill_market_module_css_default.select,
												value: source,
												onChange: (e) => {
													setSource(e.target.value);
												},
												"aria-label": t("filterAll"),
												children: [
													(0, react_jsx_runtime.jsx)("option", {
														value: "all",
														children: t("filterAll")
													}),
													(0, react_jsx_runtime.jsx)("option", {
														value: "supanexus",
														children: t("sourceSupanexus")
													}),
													(0, react_jsx_runtime.jsx)("option", {
														value: "dsh_community",
														children: t("sourceCommunity")
													})
												]
											}),
											(0, react_jsx_runtime.jsxs)("select", {
												className: skill_market_module_css_default.select,
												value: layer,
												onChange: (e) => {
													setLayer(e.target.value);
												},
												"aria-label": t("layerAll"),
												children: [
													(0, react_jsx_runtime.jsx)("option", {
														value: "all",
														children: t("layerAll")
													}),
													(0, react_jsx_runtime.jsx)("option", {
														value: "core",
														children: t("layerCore")
													}),
													(0, react_jsx_runtime.jsx)("option", {
														value: "feature",
														children: t("layerFeature")
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("input", {
												className: skill_market_module_css_default.searchInput,
												value: keyword,
												placeholder: t("searchPlaceholder"),
												onChange: (e) => {
													setKeyword(e.target.value);
												},
												onKeyDown: (e) => {
													if (e.key === "Enter") onSearch();
												}
											}),
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: skill_market_module_css_default.buttonSecondary,
												onClick: onSearch,
												children: t("searchPlaceholder").replace("…", "")
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: `${skill_market_module_css_default.segmentGroup} ${skill_market_module_css_default.segmentGroupEnd}`,
												role: "group",
												"aria-label": t("layoutLabel"),
												children: [(0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: layout === "cols3" ? `${skill_market_module_css_default.segmentButtonActive} ${skill_market_module_css_default.segmentButtonIcon}` : `${skill_market_module_css_default.segmentButton} ${skill_market_module_css_default.segmentButtonIcon}`,
													"aria-pressed": layout === "cols3",
													"aria-label": t("layoutCols3"),
													title: t("layoutCols3"),
													onClick: () => {
														setLayout("cols3");
													},
													children: (0, react_jsx_runtime.jsx)(GridCols3Icon, {})
												}), (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: layout === "cols1" ? `${skill_market_module_css_default.segmentButtonActive} ${skill_market_module_css_default.segmentButtonIcon}` : `${skill_market_module_css_default.segmentButton} ${skill_market_module_css_default.segmentButtonIcon}`,
													"aria-pressed": layout === "cols1",
													"aria-label": t("layoutCols1"),
													title: t("layoutCols1"),
													onClick: () => {
														setLayout("cols1");
													},
													children: (0, react_jsx_runtime.jsx)(ListCol1Icon, {})
												})]
											})
										]
									}),
									error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
										className: skill_market_module_css_default.alertError,
										role: "alert",
										children: error
									}),
									(0, react_jsx_runtime.jsx)("div", {
										className: skill_market_module_css_default.gridScroll,
										children: loading && items.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
											className: skill_market_module_css_default.loading,
											children: t("searchPlaceholder")
										}) : visibleItems.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
											className: skill_market_module_css_default.empty,
											children: items.length === 0 ? t("empty") : emptyMessage
										}) : (0, react_jsx_runtime.jsx)("div", {
											className: `${skill_market_module_css_default.grid} ${layout === "cols3" ? skill_market_module_css_default.gridCols3 : skill_market_module_css_default.gridCols1}`,
											children: visibleItems.map((item) => (0, react_jsx_runtime.jsx)(ListingCard, {
												item,
												state,
												layout
											}, item.id))
										})
									}),
									hasNext && (0, react_jsx_runtime.jsx)("div", {
										className: skill_market_module_css_default.footer,
										children: (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: skill_market_module_css_default.buttonSecondary,
											disabled: loading,
											onClick: loadMore,
											children: t("loadMore")
										})
									})
								]
							})]
						})
					}),
					installProgress !== void 0 ? (0, react_jsx_runtime.jsx)(InstallProgressModal, {
						progress: installProgress,
						t,
						onClose: closeInstallProgress,
						onStartInstall: startInstall,
						onStartUpgrade: startUpgrade,
						onStartUninstall: startUninstall,
						onToggleLog: toggleInstallLog
					}) : null
				]
			});
		}
		//#endregion
		//#region lib/types/client/skill-market/useSkillMarket.js
		const PAGE_SIZE = 12;
		async function loadInventory(ctx) {
			const result = await ctx.remote.pluginInventory.list();
			if (!result.ok) return /* @__PURE__ */ new Set();
			const names = /* @__PURE__ */ new Set();
			for (const entry of result.value.entries) {
				names.add(entry.moduleName);
				names.add(entry.moduleName.replace(/^@/, ""));
			}
			return names;
		}
		function isInstalled(item, installed) {
			if (installed.has(item.package_name)) return true;
			const short = item.package_name.includes("/") ? item.package_name.slice(item.package_name.indexOf("/") + 1) : item.package_name;
			return installed.has(short);
		}
		function useSkillMarket({ ctx, locale, open }) {
			const t = (0, react.useMemo)(() => skillMarketT(locale), [locale]);
			const apiLocale = (0, react.useMemo)(() => skillMarketLocaleParam(locale), [locale]);
			const [loading, setLoading] = (0, react.useState)(false);
			const [items, setItems] = (0, react.useState)([]);
			const [page, setPage] = (0, react.useState)(1);
			const [hasNext, setHasNext] = (0, react.useState)(false);
			const [keyword, setKeyword] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const [source, setSource] = (0, react.useState)("all");
			const [layer, setLayer] = (0, react.useState)("all");
			const [category, setCategory] = (0, react.useState)("all");
			const [categories, setCategories] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)();
			const [installedNames, setInstalledNames] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [installingCode, setInstallingCode] = (0, react.useState)();
			const [uninstallingCode, setUninstallingCode] = (0, react.useState)();
			const [installProgress, setInstallProgress] = (0, react.useState)();
			const [installTab, setInstallTab] = (0, react.useState)("not_installed");
			const [upgradeByCode, setUpgradeByCode] = (0, react.useState)({});
			const [toggleByPackage, setToggleByPackage] = (0, react.useState)({});
			const [togglingPackage, setTogglingPackage] = (0, react.useState)();
			const operationLockRef = (0, react.useRef)(false);
			const isOperating = installProgress?.phase === "running" || togglingPackage !== void 0;
			const hasOperationModal = installProgress !== void 0;
			const refreshInventory = (0, react.useCallback)(async () => {
				try {
					setInstalledNames(await loadInventory(ctx));
				} catch {
					setInstalledNames(/* @__PURE__ */ new Set());
				}
			}, [ctx]);
			const load = (0, react.useCallback)(async (pageNum, append) => {
				setLoading(true);
				setError(void 0);
				try {
					const data = await listPluginListings({
						locale: apiLocale,
						page: pageNum,
						page_size: PAGE_SIZE,
						...query.length > 0 ? { q: query } : {},
						...source !== "all" ? { source } : {},
						...layer !== "all" ? { layer } : {},
						...category !== "all" ? { category } : {}
					});
					setItems((prev) => append ? [...prev, ...data.items ?? []] : data.items ?? []);
					setHasNext(!!data.has_next_page);
					setPage(data.page ?? pageNum);
				} catch (e) {
					const message = e instanceof Error ? e.message : t("loadFailed");
					setError(message === "HOST_API_NOT_FOUND" ? t("hostApiMissing") : message);
					if (!append) setItems([]);
				} finally {
					setLoading(false);
				}
			}, [
				apiLocale,
				query,
				source,
				layer,
				category,
				t
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				listPluginCategories({ locale: apiLocale }).then((data) => {
					setCategories(data.items ?? []);
				}).catch(() => {
					setCategories([]);
				});
			}, [open, apiLocale]);
			(0, react.useEffect)(() => {
				if (!open) return;
				refreshInventory();
			}, [open, refreshInventory]);
			(0, react.useEffect)(() => {
				if (!open) return;
				load(1, false);
			}, [
				open,
				query,
				source,
				layer,
				category,
				load
			]);
			const refreshUpgradeStatus = (0, react.useCallback)(async (codes) => {
				if (codes.length === 0) {
					setUpgradeByCode({});
					return;
				}
				try {
					const data = await fetchPluginUpgradeStatus(codes, apiLocale);
					const next = {};
					for (const entry of data.items ?? []) next[entry.install_code] = entry;
					setUpgradeByCode(next);
				} catch {
					setUpgradeByCode({});
				}
			}, [apiLocale]);
			(0, react.useEffect)(() => {
				if (!open || installTab !== "installed") return;
				const codes = items.filter((item) => isInstalled(item, installedNames)).map((item) => item.install_code);
				refreshUpgradeStatus(codes);
			}, [
				open,
				installTab,
				items,
				installedNames,
				refreshUpgradeStatus
			]);
			const refreshToggleStatus = (0, react.useCallback)(async (packageNames) => {
				if (packageNames.length === 0) {
					setToggleByPackage({});
					return;
				}
				try {
					const data = await fetchPluginToggleStatus(packageNames);
					const next = {};
					for (const entry of data.items ?? []) next[entry.package_name] = entry;
					setToggleByPackage(next);
				} catch {
					setToggleByPackage({});
				}
			}, []);
			(0, react.useEffect)(() => {
				if (!open || installTab !== "installed") return;
				const names = items.filter((item) => isInstalled(item, installedNames)).map((item) => item.package_name);
				refreshToggleStatus(names);
			}, [
				open,
				installTab,
				items,
				installedNames,
				refreshToggleStatus
			]);
			const onSearch = (0, react.useCallback)(() => {
				setQuery(keyword.trim());
			}, [keyword]);
			const closeInstallProgress = (0, react.useCallback)(() => {
				setInstallProgress(void 0);
				setInstallingCode(void 0);
				setUninstallingCode(void 0);
			}, []);
			const toggleInstallLog = (0, react.useCallback)(() => {
				setInstallProgress((prev) => prev === void 0 ? prev : {
					...prev,
					showLog: !prev.showLog
				});
			}, []);
			const runInstall = (0, react.useCallback)(async (item) => {
				if (operationLockRef.current) return;
				operationLockRef.current = true;
				setInstallingCode(item.install_code);
				setInstallProgress({
					operation: "install",
					item,
					phase: "running",
					log: "",
					showLog: true
				});
				setError(void 0);
				try {
					const result = await installPlugin(item.install_code, apiLocale);
					const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : "");
					setInstallProgress({
						operation: "install",
						item,
						phase: "success",
						log,
						showLog: true,
						provider: result.provider
					});
					await refreshInventory();
					if (installTab === "installed") await refreshUpgradeStatus([item.install_code]);
				} catch (e) {
					const raw = e instanceof Error ? e.message : t("installFailed");
					const message = raw === "HOST_API_NOT_FOUND" ? t("hostApiMissing") : raw;
					const log = e instanceof InstallPluginError ? e.log ?? "" : "";
					setInstallProgress({
						operation: "install",
						item,
						phase: "error",
						log,
						showLog: true,
						errorMessage: message
					});
				} finally {
					setInstallingCode(void 0);
					operationLockRef.current = false;
				}
			}, [
				apiLocale,
				installTab,
				refreshInventory,
				refreshUpgradeStatus,
				t
			]);
			const onInstall = (0, react.useCallback)((item) => {
				if (operationLockRef.current || hasOperationModal) return;
				setInstallProgress({
					operation: "install",
					item,
					phase: "confirm",
					log: "",
					showLog: false
				});
			}, [hasOperationModal]);
			const startInstall = (0, react.useCallback)(() => {
				if (installProgress?.operation !== "install" || installProgress.phase !== "confirm") return;
				runInstall(installProgress.item);
			}, [installProgress, runInstall]);
			const runUpgrade = (0, react.useCallback)(async (item, targetVersion, remoteVersion) => {
				if (operationLockRef.current) return;
				operationLockRef.current = true;
				setInstallingCode(item.install_code);
				const versionFields = {
					...targetVersion !== void 0 && targetVersion.length > 0 ? { targetVersion } : {},
					...remoteVersion !== void 0 && remoteVersion.length > 0 ? { remoteVersion } : {}
				};
				setInstallProgress({
					operation: "upgrade",
					item,
					phase: "running",
					log: "",
					showLog: true,
					...versionFields
				});
				setError(void 0);
				try {
					const result = await installPlugin(item.install_code, apiLocale);
					const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : "");
					setInstallProgress({
						operation: "upgrade",
						item,
						phase: "success",
						log,
						showLog: true,
						provider: result.provider,
						...versionFields
					});
					await refreshInventory();
					await refreshUpgradeStatus([item.install_code]);
				} catch (e) {
					const raw = e instanceof Error ? e.message : t("upgradeFailed");
					const message = raw === "HOST_API_NOT_FOUND" ? t("hostApiMissing") : raw;
					const log = e instanceof InstallPluginError ? e.log ?? "" : "";
					setInstallProgress({
						operation: "upgrade",
						item,
						phase: "error",
						log,
						showLog: true,
						errorMessage: message,
						...versionFields
					});
				} finally {
					setInstallingCode(void 0);
					operationLockRef.current = false;
				}
			}, [
				apiLocale,
				refreshInventory,
				refreshUpgradeStatus,
				t
			]);
			const onUpgrade = (0, react.useCallback)((item) => {
				if (operationLockRef.current || hasOperationModal) return;
				const status = upgradeByCode[item.install_code];
				if (status?.upgradeable !== true) return;
				const listingVersion = status.listing_version ?? item.version?.trim() ?? void 0;
				operationLockRef.current = true;
				setInstallProgress({
					operation: "upgrade",
					item,
					phase: "running",
					log: "",
					showLog: false,
					...listingVersion !== void 0 && listingVersion.length > 0 ? { targetVersion: listingVersion } : {}
				});
				(async () => {
					try {
						const remote = await fetchPluginRemoteVersion(item.install_code, apiLocale);
						setInstallProgress({
							operation: "upgrade",
							item,
							phase: "confirm",
							log: "",
							showLog: false,
							...listingVersion !== void 0 && listingVersion.length > 0 ? { targetVersion: listingVersion } : {},
							...remote.version !== null && remote.version.length > 0 ? { remoteVersion: remote.version } : {}
						});
					} catch {
						setInstallProgress({
							operation: "upgrade",
							item,
							phase: "confirm",
							log: "",
							showLog: false,
							...listingVersion !== void 0 && listingVersion.length > 0 ? { targetVersion: listingVersion } : {}
						});
					} finally {
						operationLockRef.current = false;
					}
				})();
			}, [
				apiLocale,
				hasOperationModal,
				upgradeByCode
			]);
			const startUpgrade = (0, react.useCallback)(() => {
				if (installProgress?.operation !== "upgrade" || installProgress.phase !== "confirm") return;
				runUpgrade(installProgress.item, installProgress.targetVersion, installProgress.remoteVersion);
			}, [installProgress, runUpgrade]);
			const runUninstall = (0, react.useCallback)(async (item) => {
				if (operationLockRef.current) return;
				operationLockRef.current = true;
				setUninstallingCode(item.install_code);
				setInstallProgress({
					operation: "uninstall",
					item,
					phase: "running",
					log: "",
					showLog: true
				});
				setError(void 0);
				try {
					const result = await uninstallPlugin(item.package_name, item.install_code);
					const log = result.log ?? (result.cliCommand.length > 0 ? `$ ${result.cliCommand}\n` : "");
					setInstallProgress({
						operation: "uninstall",
						item,
						phase: "success",
						log,
						showLog: true
					});
					await refreshInventory();
					if (installTab === "installed") await refreshUpgradeStatus([item.install_code]);
				} catch (e) {
					const raw = e instanceof Error ? e.message : t("uninstallFailed");
					const message = raw === "HOST_API_NOT_FOUND" ? t("hostApiMissing") : raw;
					const log = e instanceof InstallPluginError ? e.log ?? "" : "";
					setInstallProgress({
						operation: "uninstall",
						item,
						phase: "error",
						log,
						showLog: true,
						errorMessage: message
					});
				} finally {
					setUninstallingCode(void 0);
					operationLockRef.current = false;
				}
			}, [
				installTab,
				refreshInventory,
				refreshUpgradeStatus,
				t
			]);
			const onUninstall = (0, react.useCallback)((item) => {
				if (operationLockRef.current || hasOperationModal || !canUninstallPlugin(item)) return;
				setInstallProgress({
					operation: "uninstall",
					item,
					phase: "confirm",
					log: "",
					showLog: false
				});
			}, [hasOperationModal]);
			const startUninstall = (0, react.useCallback)(() => {
				if (installProgress?.operation !== "uninstall" || installProgress.phase !== "confirm") return;
				runUninstall(installProgress.item);
			}, [installProgress, runUninstall]);
			const checkInstalled = (0, react.useCallback)((item) => isInstalled(item, installedNames), [installedNames]);
			const checkCanUninstall = (0, react.useCallback)((item) => canUninstallPlugin(item), []);
			const getUpgradeStatus = (0, react.useCallback)((item) => upgradeByCode[item.install_code], [upgradeByCode]);
			return {
				t,
				loading,
				items,
				page,
				hasNext,
				keyword,
				setKeyword,
				source,
				setSource,
				layer,
				setLayer,
				category,
				setCategory,
				categories,
				error,
				installingCode,
				uninstallingCode,
				togglingPackage,
				isOperating,
				hasOperationModal,
				installProgress,
				installedNames,
				installTab,
				setInstallTab,
				upgradeByCode,
				toggleByPackage,
				onSearch,
				onInstall,
				startInstall,
				onUpgrade,
				startUpgrade,
				onUninstall,
				startUninstall,
				closeInstallProgress,
				toggleInstallLog,
				loadMore: () => {
					load(page + 1, true);
				},
				isInstalled: checkInstalled,
				canUninstall: checkCanUninstall,
				canToggle: (0, react.useCallback)((item) => canTogglePlugin(item), []),
				getToggleStatus: (0, react.useCallback)((item) => toggleByPackage[item.package_name], [toggleByPackage]),
				onToggle: (0, react.useCallback)((item, enabled) => {
					if (operationLockRef.current || hasOperationModal || !canTogglePlugin(item)) return;
					operationLockRef.current = true;
					setTogglingPackage(item.package_name);
					(async () => {
						try {
							const result = await setPluginEnabled(item.package_name, enabled);
							setToggleByPackage((prev) => ({
								...prev,
								[item.package_name]: {
									package_name: item.package_name,
									enabled: result.enabled,
									row_ids: result.row_ids,
									toggleable: true
								}
							}));
							if (result.needsRefresh) window.setTimeout(() => {
								window.location.reload();
							}, 1200);
						} catch (e) {
							const raw = e instanceof Error ? e.message : t("toggleFailed");
							setError(raw === "HOST_API_NOT_FOUND" ? t("hostApiMissing") : raw);
						} finally {
							setTogglingPackage(void 0);
							operationLockRef.current = false;
						}
					})();
				}, [hasOperationModal, t]),
				getUpgradeStatus
			};
		}
		//#endregion
		//#region lib/types/client/skill-market/SkillMarketRoot.js
		function SkillMarketIcon({ size }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "2",
						width: "5",
						height: "5",
						rx: "1.2",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "9",
						y: "2",
						width: "5",
						height: "5",
						rx: "1.2",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "9",
						width: "5",
						height: "5",
						rx: "1.2",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "9",
						y: "9",
						width: "5",
						height: "5",
						rx: "1.2",
						stroke: "currentColor",
						strokeWidth: "1.2"
					})
				]
			});
		}
		/** Sidebar footer trigger + skill market modal. */
		function SkillMarketRoot({ wide, ctx, settings }) {
			const locale = useClientLocale(ctx);
			const t = skillMarketT(locale);
			const lineId = useActiveLineId(settings);
			const officialSiteUrl = (0, react.useMemo)(() => buildOfficialSiteUrl({
				lineId,
				locale: locale ?? null
			}), [lineId, locale]);
			const [open, setOpen] = (0, react.useState)(false);
			const titleId = (0, react.useId)();
			const state = useSkillMarket({
				ctx,
				locale,
				open
			});
			const close = (0, react.useCallback)(() => {
				setOpen(false);
			}, []);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") close();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [close, open]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: skill_market_module_css_default.layer,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: wide ? skill_market_module_css_default.trigger : `${skill_market_module_css_default.trigger} ${skill_market_module_css_default.rail}`,
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-labelledby": titleId,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [(0, react_jsx_runtime.jsx)(SkillMarketIcon, { size: wide ? 16 : 18 }), wide && (0, react_jsx_runtime.jsx)("span", {
						className: skill_market_module_css_default.triggerLabel,
						id: titleId,
						children: t("nav")
					})]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					className: skill_market_module_css_default.overlay,
					role: "presentation",
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: skill_market_module_css_default.mask,
						"aria-hidden": "true",
						onClick: close
					}), (0, react_jsx_runtime.jsx)(SkillMarketPanel, {
						state,
						onClose: close,
						officialSiteUrl
					})]
				})]
			});
		}
		//#endregion
		//#region lib/types/shared/wallet-contract.js
		/** Host ↔ Client contract for SupaNexus wallet / budget deep-link. */
		/** Lightweight connection probe for sidebar visibility. */
		const WALLET_STATUS_PATH = "/api/supanexus.wallet.status";
		/** Fetch organization balance (Host refreshes harness session first). */
		const WALLET_PATH = "/api/supanexus.wallet";
		/** Minimum Client poll interval for wallet (Harness rate-limit guidance). */
		const WALLET_POLL_MS = 6e4;
		/** Error codes returned on wallet failures (Client branching). */
		const WALLET_ERROR = {
			notConnected: "wallet.not_connected",
			sessionRevoked: "wallet.session_revoked",
			noDevice: "wallet.no_device"
		};
		//#endregion
		//#region lib/types/client/wallet/format.js
		/** Format wallet amount for sidebar / panel display. */
		/** Compact currency label for the sidebar trigger. */
		function formatWalletAmount(balance, currency) {
			const amount = balance.trim();
			const code = currency.trim().toUpperCase();
			if (amount.length === 0) return "—";
			if (code === "USD") return `$${amount}`;
			if (code.length === 0) return amount;
			return `${amount} ${code}`;
		}
		//#endregion
		//#region lib/types/client/wallet/useActiveModelProvider.js
		/** Subscribe to the active session's model provider (shared modelDirectories state). */
		/**
		* Provider id of the currently opened session's model selection.
		* `undefined` while sessions/modelDirectories are unavailable;
		* `null` when there is no current session or no selection yet.
		*/
		function useActiveModelProvider(ctx) {
			const [provider, setProvider] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				const sessions = ctx.get("sessions");
				const models = ctx.get("modelDirectories");
				if (sessions === void 0 || models === void 0) {
					setProvider(void 0);
					return;
				}
				let attachedId;
				let stopDirectory;
				let disposed = false;
				let retryTimer;
				const clearRetry = () => {
					if (retryTimer !== void 0) {
						clearTimeout(retryTimer);
						retryTimer = void 0;
					}
				};
				const detachDirectory = () => {
					stopDirectory?.();
					stopDirectory = void 0;
					attachedId = void 0;
				};
				const attachDirectory = (id) => {
					let directory;
					try {
						directory = models.directoryFor(id);
					} catch {
						return false;
					}
					detachDirectory();
					attachedId = id;
					const syncProvider = () => {
						if (disposed) return;
						setProvider(directory.store.getSnapshot().current?.provider ?? null);
					};
					syncProvider();
					stopDirectory = directory.store.subscribe(syncProvider);
					directory.load().then(syncProvider, () => {});
					return true;
				};
				const syncSession = () => {
					if (disposed) return;
					clearRetry();
					const next = sessions.list.getSnapshot().current;
					if (next === void 0) {
						detachDirectory();
						setProvider(null);
						return;
					}
					if (next === attachedId && stopDirectory !== void 0) return;
					if (attachDirectory(next)) return;
					detachDirectory();
					setProvider(null);
					retryTimer = setTimeout(() => {
						retryTimer = void 0;
						if (disposed) return;
						const again = sessions.list.getSnapshot().current;
						if (again === void 0) return;
						if (!attachDirectory(again)) queueMicrotask(() => {
							if (disposed) return;
							const last = sessions.list.getSnapshot().current;
							if (last !== void 0) attachDirectory(last);
						});
					}, 0);
				};
				syncSession();
				const stopSessions = sessions.list.subscribe(syncSession);
				return () => {
					disposed = true;
					clearRetry();
					stopSessions();
					detachDirectory();
				};
			}, [ctx]);
			return provider;
		}
		//#endregion
		//#region lib/types/client/wallet/visibility.js
		/** Derive whether the sidebar wallet should render. */
		/**
		* Show wallet when the user preference allows it, SupaNexus is connected,
		* and the active session model provider is the SupaNexus route (`supanexus`).
		*/
		function shouldShowWallet(connected, provider, showWallet = false) {
			return showWallet && connected && provider === "supanexus";
		}
		//#endregion
		//#region lib/types/client/wallet/locales.js
		/** Wallet sidebar locale dictionary. */
		const zh = {
			nav: "余额",
			title: "SupaNexus 余额",
			close: "关闭",
			balanceLabel: "可用余额",
			orgLabel: "组织",
			refresh: "刷新",
			loading: "正在加载余额…",
			configureBudget: "配置预算",
			visibilityHint: "仅当前模型服务商为 SupaNexus 时显示。",
			budgetHint: "配额预算请登录到控制台中进行配置",
			reauthHint: "会话已失效。请打开设置 → 模型，重新执行 SupaNexus 快速配置。",
			hostApiMissing: "Host 余额接口未加载。请在插件目录执行 pnpm build 后完全重启 dsh web。",
			error: "无法获取余额。",
			notConnected: "尚未配置 SupaNexus。"
		};
		const en = {
			nav: "Balance",
			title: "SupaNexus balance",
			close: "Close",
			balanceLabel: "Available balance",
			orgLabel: "Organization",
			refresh: "Refresh",
			loading: "Loading balance…",
			configureBudget: "Configure budget",
			visibilityHint: "Shown only when the current model provider is SupaNexus.",
			budgetHint: "Sign in to the console to configure quota budgets.",
			reauthHint: "Session expired. Open Settings → Models and run SupaNexus Quick Setup again.",
			hostApiMissing: "Host wallet API is missing. Run pnpm build in the plugin directory, then fully restart dsh web.",
			error: "Could not load balance.",
			notConnected: "SupaNexus is not configured yet."
		};
		/** Resolve locale tag to wallet dictionary accessor. */
		function walletT(locale) {
			const dict = locale?.startsWith("zh") ? zh : en;
			return (key) => dict[key];
		}
		//#endregion
		//#region lib/types/client/wallet/wire.js
		/** Browser fetch wrappers for wallet Host API routes. */
		async function readResponseBody(response) {
			if ((response.headers.get("content-type") ?? "").includes("application/json")) return response.json();
			const text = await response.text();
			if (text.length === 0) return {};
			try {
				return JSON.parse(text);
			} catch {
				return { message: text };
			}
		}
		async function parseJson(response) {
			const body = await readResponseBody(response);
			if (!response.ok || body.ok === false) {
				if (response.status === 404) throw new Error(typeof body.message === "string" && body.message.length > 0 ? body.message : "HOST_API_NOT_FOUND");
				const message = typeof body.message === "string" && body.message.length > 0 ? body.message : `HTTP ${String(response.status)}`;
				const error = new Error(message);
				if (typeof body.code === "string") error.code = body.code;
				throw error;
			}
			return body;
		}
		/** Probe whether SupaNexus credentials exist (sidebar visibility). */
		async function fetchWalletStatus() {
			const url = new URL(WALLET_STATUS_PATH, window.location.origin);
			return parseJson(await fetch(url));
		}
		/** Fetch organization balance via Host (refresh + wallet). */
		async function fetchWalletBalance(locale) {
			const url = new URL(WALLET_PATH, window.location.origin);
			if (locale !== void 0 && locale.length > 0) url.searchParams.set("locale", locale);
			return parseJson(await fetch(url));
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/wallet/wallet.module.css.mjs
		const css$1 = ".HtX0mG_layer{flex:none;align-items:center;width:100%;display:flex;position:relative}.HtX0mG_trigger{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}.HtX0mG_trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}.HtX0mG_trigger.HtX0mG_rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}.HtX0mG_triggerLabel{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.HtX0mG_amountLabel{font-variant-numeric:tabular-nums;letter-spacing:.01em;font-weight:600}.HtX0mG_overlay{z-index:1000;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.HtX0mG_mask{background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);position:absolute;inset:0}.HtX0mG_panel{z-index:1;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2);width:min(420px,100vw - 32px);max-height:min(520px,100vh - 32px);box-shadow:var(--dsw-shadow-lv3);border-radius:20px;flex-direction:column;gap:16px;padding:20px 22px 22px;display:flex;position:relative;overflow:auto}.HtX0mG_header{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.HtX0mG_title{color:var(--dsw-alias-label-primary);margin:0;font-size:18px;font-weight:600;line-height:1.35}.HtX0mG_closeBtn{width:32px;height:32px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:8px;flex:none;font-size:18px;line-height:1}.HtX0mG_closeBtn:hover{background:var(--dsw-alias-interactive-bg-hover)}.HtX0mG_balanceBlock{flex-direction:column;gap:6px;display:flex}.HtX0mG_balanceLabel{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.4}.HtX0mG_balanceValue{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;margin:0;font-size:28px;font-weight:650;line-height:1.2}.HtX0mG_orgRow{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.4}.HtX0mG_notice{background:var(--dsw-alias-bg-module-platform,#1212f90f);color:var(--dsw-alias-label-secondary);border-radius:10px;margin:0;padding:8px 10px;font-size:12px;line-height:1.5}.HtX0mG_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.HtX0mG_status{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.5}.HtX0mG_error{color:var(--dsw-alias-status-danger,#c62828);margin:0;font-size:13px;line-height:1.5}.HtX0mG_actions{flex-wrap:wrap;gap:8px;display:flex}.HtX0mG_button{background:var(--dsw-alias-interactive-bg-primary,#1212f9);color:#fff;cursor:pointer;border:none;border-radius:10px;justify-content:center;align-items:center;min-height:36px;padding:0 14px;font-family:inherit;font-size:13px;font-weight:500;display:inline-flex}.HtX0mG_button:disabled{opacity:.55;cursor:not-allowed}.HtX0mG_buttonSecondary{border:1px solid var(--dsw-alias-border-primary,#0000001f);min-height:36px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border-radius:10px;justify-content:center;align-items:center;padding:0 14px;font-family:inherit;font-size:13px;font-weight:500;display:inline-flex}.HtX0mG_buttonSecondary:disabled{opacity:.55;cursor:not-allowed}";
		const tagId$1 = "@supanexus/dsh-plugin-supanexus-core/wallet.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var wallet_module_css_default = {
			"actions": "HtX0mG_actions",
			"amountLabel": "HtX0mG_amountLabel",
			"balanceBlock": "HtX0mG_balanceBlock",
			"balanceLabel": "HtX0mG_balanceLabel",
			"balanceValue": "HtX0mG_balanceValue",
			"button": "HtX0mG_button",
			"buttonSecondary": "HtX0mG_buttonSecondary",
			"closeBtn": "HtX0mG_closeBtn",
			"error": "HtX0mG_error",
			"header": "HtX0mG_header",
			"hint": "HtX0mG_hint",
			"layer": "HtX0mG_layer",
			"mask": "HtX0mG_mask",
			"notice": "HtX0mG_notice",
			"orgRow": "HtX0mG_orgRow",
			"overlay": "HtX0mG_overlay",
			"panel": "HtX0mG_panel",
			"rail": "HtX0mG_rail",
			"status": "HtX0mG_status",
			"title": "HtX0mG_title",
			"trigger": "HtX0mG_trigger",
			"triggerLabel": "HtX0mG_triggerLabel"
		};
		//#endregion
		//#region lib/types/client/wallet/WalletPanel.js
		/** Compact modal: balance + console budget deep link. */
		function WalletPanel({ locale, onClose, onBalanceChange }) {
			const t = walletT(locale);
			const [loading, setLoading] = (0, react.useState)(true);
			const [data, setData] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [sessionRevoked, setSessionRevoked] = (0, react.useState)(false);
			const [usagePoliciesUrl, setUsagePoliciesUrl] = (0, react.useState)();
			const load = (0, react.useCallback)(async () => {
				setLoading(true);
				setError(void 0);
				setSessionRevoked(false);
				const dict = walletT(locale);
				try {
					const status = await fetchWalletStatus();
					setUsagePoliciesUrl(status.usagePoliciesUrl);
					const balance = await fetchWalletBalance(locale);
					setData(balance);
					setUsagePoliciesUrl(balance.usagePoliciesUrl);
					onBalanceChange?.(formatWalletAmount(balance.availableBalance, balance.currency));
				} catch (cause) {
					setData(void 0);
					const err = cause;
					if (err.message === "HOST_API_NOT_FOUND" || err.message === "not found") setError(dict("hostApiMissing"));
					else if (err.code === WALLET_ERROR.sessionRevoked) {
						setSessionRevoked(true);
						setError(dict("reauthHint"));
					} else setError(err.message.length > 0 ? err.message : dict("error"));
				} finally {
					setLoading(false);
				}
			}, [locale, onBalanceChange]);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useEffect)(() => {
				if (sessionRevoked) return;
				const timer = window.setInterval(() => {
					load();
				}, WALLET_POLL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, [load, sessionRevoked]);
			const openBudget = (0, react.useCallback)(() => {
				const url = usagePoliciesUrl ?? data?.usagePoliciesUrl;
				if (url === void 0 || url.length === 0) return;
				window.open(url, "_blank", "noopener,noreferrer");
			}, [data?.usagePoliciesUrl, usagePoliciesUrl]);
			const budgetUrl = usagePoliciesUrl ?? data?.usagePoliciesUrl;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: wallet_module_css_default.panel,
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "supanexus-wallet-title",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: wallet_module_css_default.header,
						children: [(0, react_jsx_runtime.jsx)("h2", {
							className: wallet_module_css_default.title,
							id: "supanexus-wallet-title",
							children: t("title")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: wallet_module_css_default.closeBtn,
							"aria-label": t("close"),
							onClick: onClose,
							children: "×"
						})]
					}),
					loading && data === void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: wallet_module_css_default.status,
						children: t("loading")
					}) : null,
					data !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: wallet_module_css_default.balanceBlock,
						children: [
							(0, react_jsx_runtime.jsx)("p", {
								className: wallet_module_css_default.balanceLabel,
								children: t("balanceLabel")
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: wallet_module_css_default.balanceValue,
								children: formatWalletAmount(data.availableBalance, data.currency)
							}),
							data.name.trim().length > 0 ? (0, react_jsx_runtime.jsxs)("p", {
								className: wallet_module_css_default.orgRow,
								children: [
									t("orgLabel"),
									": ",
									data.name
								]
							}) : null
						]
					}) : null,
					(0, react_jsx_runtime.jsx)("p", {
						className: wallet_module_css_default.notice,
						children: t("visibilityHint")
					}),
					error !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: sessionRevoked ? wallet_module_css_default.hint : wallet_module_css_default.error,
						children: error
					}) : (0, react_jsx_runtime.jsx)("p", {
						className: wallet_module_css_default.hint,
						children: t("budgetHint")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: wallet_module_css_default.actions,
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: wallet_module_css_default.button,
							disabled: budgetUrl === void 0 || budgetUrl.length === 0,
							onClick: openBudget,
							children: t("configureBudget")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: wallet_module_css_default.buttonSecondary,
							disabled: loading,
							onClick: () => {
								load();
							},
							children: t("refresh")
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/wallet/WalletRoot.js
		function WalletIcon({ size }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "1.5",
						y: "3.5",
						width: "13",
						height: "9",
						rx: "2",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M1.5 6.5h13",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "11.5",
						cy: "9.5",
						r: "1",
						fill: "currentColor"
					})
				]
			});
		}
		/**
		* Sidebar balance row (amount as label) + detail modal.
		* Visible when the plugin setting allows it, SupaNexus is connected, and the
		* active session's model provider is `supanexus`.
		*/
		function WalletRoot({ wide, ctx, settings }) {
			const locale = useClientLocale(ctx);
			const t = walletT(locale);
			const provider = useActiveModelProvider(ctx);
			const showWalletPref = useShowWalletPref(settings);
			const [connected, setConnected] = (0, react.useState)(false);
			const [amountLabel, setAmountLabel] = (0, react.useState)();
			const [open, setOpen] = (0, react.useState)(false);
			const titleId = (0, react.useId)();
			const close = (0, react.useCallback)(() => {
				setOpen(false);
			}, []);
			const visible = shouldShowWallet(connected, provider, showWalletPref);
			const refresh = (0, react.useCallback)(async () => {
				try {
					if (!(await fetchWalletStatus()).connected) {
						setConnected(false);
						setAmountLabel(void 0);
						return;
					}
					setConnected(true);
					try {
						const balance = await fetchWalletBalance(locale);
						setAmountLabel(formatWalletAmount(balance.availableBalance, balance.currency));
					} catch {
						setAmountLabel(void 0);
					}
				} catch {
					setConnected(false);
					setAmountLabel(void 0);
				}
			}, [locale]);
			(0, react.useEffect)(() => {
				refresh();
				const timer = window.setInterval(() => {
					refresh();
				}, WALLET_POLL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, [refresh]);
			(0, react.useEffect)(() => {
				if (!visible && open) setOpen(false);
			}, [open, visible]);
			(0, react.useEffect)(() => {
				if (!open) return;
				refresh();
				const onKeyDown = (event) => {
					if (event.key === "Escape") close();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [
				close,
				open,
				refresh
			]);
			if (!visible) return null;
			const display = amountLabel ?? t("nav");
			const title = amountLabel === void 0 ? `${t("nav")} — ${t("visibilityHint")}` : `${t("nav")} ${amountLabel} — ${t("visibilityHint")}`;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: wallet_module_css_default.layer,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: wide ? wallet_module_css_default.trigger : `${wallet_module_css_default.trigger} ${wallet_module_css_default.rail}`,
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": title,
					title,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [(0, react_jsx_runtime.jsx)(WalletIcon, { size: wide ? 16 : 18 }), wide && (0, react_jsx_runtime.jsx)("span", {
						className: `${wallet_module_css_default.triggerLabel} ${wallet_module_css_default.amountLabel}`,
						id: titleId,
						children: display
					})]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					className: wallet_module_css_default.overlay,
					role: "presentation",
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: wallet_module_css_default.mask,
						"aria-hidden": "true",
						onClick: close
					}), (0, react_jsx_runtime.jsx)(WalletPanel, {
						locale,
						onClose: close,
						onBalanceChange: setAmountLabel
					})]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/core/dsh-plugin-supanexus-core/src/client/sidebar-footer/sidebar-footer.module.css.mjs
		const css = ".sLsDGq_stack{flex-direction:column;align-items:stretch;width:100%;min-width:0;display:flex}";
		const tagId = "@supanexus/dsh-plugin-supanexus-core/sidebar-footer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@supanexus/dsh-plugin-supanexus-core";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var sidebar_footer_module_css_default = { "stack": "sLsDGq_stack" };
		//#endregion
		//#region lib/types/client/sidebar-footer/SidebarFooterRoot.js
		/**
		* One footer occupant stacking wallet + skill market vertically.
		* Official `.footerActions` is a row flex; two separate registrants sit side-by-side and squeeze each other.
		*/
		function SidebarFooterRoot(props) {
			const { settings, ...rest } = props;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: sidebar_footer_module_css_default.stack,
				children: [(0, react_jsx_runtime.jsx)(WalletRoot, {
					...rest,
					settings
				}), (0, react_jsx_runtime.jsx)(SkillMarketRoot, {
					...rest,
					settings
				})]
			});
		}
		//#endregion
		//#region lib/types/client/sidebar-footer/index.js
		/** Register one stacked footer action (avoids row-flex squeeze of two registrants). */
		function registerSidebarFooter(ctx, settings) {
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "supanexus-sidebar-footer",
				order: 0,
				label: () => skillMarketT(ctx.locale.getSnapshot().active)("nav")
			}, (props) => (0, react_jsx_runtime.jsx)(SidebarFooterRoot, {
				ctx,
				settings,
				...props
			})));
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Required client services. */
		const inject = [
			"slots",
			"remote",
			"remote.settings",
			"remote.pluginInventory",
			"locale",
			"connection",
			"settingsScope"
		];
		/**
		* Register all SupaNexus client features (orchestration only).
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			const settings = ctx.settingsScope.bind({ namespace: SUPANEXUS_SETTINGS_NS });
			registerBrand(ctx, settings);
			registerHero(ctx, settings);
			registerQuickSetup(ctx);
			registerPluginSettings(ctx, settings);
			registerSidebarFooter(ctx, settings);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map