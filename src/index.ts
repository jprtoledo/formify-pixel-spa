'use client';

export interface UserData {
    em?: string;
    fn?: string;
    ln?: string;
    ph?: string;
    external_id?: string;
    ge?: 'f' | 'm';
    db?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
}

export interface CustomData {
    content_category?: string;
    content_ids?: string | string[];
    content_name?: string;
    content_type?: 'product' | 'product_group';
    contents?: Array<{ id: string; quantity: number; [key: string]: any }>;
    currency?: string;
    num_items?: number;
    predicted_ltv?: number;
    search_string?: string;
    status?: boolean;
    value?: number;

    [key: string]: any;
}

export type StandardEvent =
    | 'AddPaymentInfo'
    | 'AddToCart'
    | 'AddToWishlist'
    | 'CompleteRegistration'
    | 'Contact'
    | 'CustomizeProduct'
    | 'Donate'
    | 'FindLocation'
    | 'InitiateCheckout'
    | 'Lead'
    | 'Purchase'
    | 'Schedule'
    | 'Search'
    | 'StartTrial'
    | 'SubmitApplication'
    | 'Subscribe'
    | 'ViewContent';

async function sha256(message: string): Promise<string> {
    if (typeof window === 'undefined') return '';
    const msgUint8 = new TextEncoder().encode(message.toLowerCase().trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeUserData(key: keyof UserData, value: string): string {
    const val = value.toLowerCase().trim();
    if (key === 'ph' || key === 'db' || key === 'zp') {
        return val.replace(/\D/g, ''); // Somente dígitos
    }
    if (key === 'ct') {
        return val.replace(/\s+/g, ''); // Sem espaços
    }
    return val;
}

export class MetaPixelTracker {
    private pixelId: string;

    constructor(pixelId: string) {
        this.pixelId = pixelId;
    }

    private async buildUrl(
        event: string,
        customData?: CustomData,
        userData?: UserData,
        eventId?: string
    ): Promise<string> {
        const url = new URL('https://www.facebook.com/tr/');
        url.searchParams.set('id', this.pixelId);
        url.searchParams.set('ev', event);

        if (eventId) {
            url.searchParams.set('eid', eventId);
        }

        if (userData) {
            for (const [key, value] of Object.entries(userData)) {
                if (value) {
                    const normalized = normalizeUserData(key as keyof UserData, String(value));
                    const hashed = await sha256(normalized);
                    url.searchParams.set(`ud[${key}]`, hashed);
                }
            }
        }

        if (customData) {
            for (const [key, value] of Object.entries(customData)) {
                if (value !== undefined) {
                    const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                    url.searchParams.set(`cd[${key}]`, formattedValue);
                }
            }
        }

        return url.toString();
    }

    private async dispatch(event: string, customData?: CustomData, userData?: UserData, eventId?: string) {
        if (typeof window === "undefined") return;

        const url = await this.buildUrl(event, customData, userData, eventId);
        const img = new Image(1, 1);
        img.style.display = 'none';
        img.src = url;
        document.body.appendChild(img);
    }

    public async trackAddPaymentInfo(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('AddPaymentInfo', cd, ud, eid);
    }

    public async trackAddToCart(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('AddToCart', cd, ud, eid);
    }

    public async trackAddToWishlist(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('AddToWishlist', cd, ud, eid);
    }

    public async trackCompleteRegistration(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('CompleteRegistration', cd, ud, eid);
    }

    public async trackContact(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Contact', cd, ud, eid);
    }

    public async trackCustomizeProduct(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('CustomizeProduct', cd, ud, eid);
    }

    public async trackDonate(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Donate', cd, ud, eid);
    }

    public async trackFindLocation(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('FindLocation', cd, ud, eid);
    }

    public async trackInitiateCheckout(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('InitiateCheckout', cd, ud, eid);
    }

    public async trackLead(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Lead', cd, ud, eid);
    }

    public async trackPurchase(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Purchase', cd, ud, eid);
    }

    public async trackSchedule(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Schedule', cd, ud, eid);
    }

    public async trackSearch(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Search', cd, ud, eid);
    }

    public async trackStartTrial(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('StartTrial', cd, ud, eid);
    }

    public async trackSubmitApplication(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('SubmitApplication', cd, ud, eid);
    }

    public async trackSubscribe(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('Subscribe', cd, ud, eid);
    }

    public async trackViewContent(cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch('ViewContent', cd, ud, eid);
    }

    public async trackPageView() {
        await this.dispatch('PageView');
    }

    public async trackCustom(eventName: string, cd?: CustomData, ud?: UserData, eid?: string) {
        await this.dispatch(eventName, cd, ud, eid);
    }
}

let globalTracker: MetaPixelTracker | null = null;

export function init(pixelId: string): void {
    if (typeof window === "undefined") return;
    globalTracker = new MetaPixelTracker(pixelId);
}

function getTracker(): MetaPixelTracker {
    if (!globalTracker) {
        throw new Error('MetaPixelTracker not initialized. Call `init(pixelId)` to start it.');
    }
    return globalTracker;
}

export const trackPageView = () => getTracker().trackPageView();
export const trackAddPaymentInfo = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackAddPaymentInfo(cd, ud, eid);
export const trackAddToCart = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackAddToCart(cd, ud, eid);
export const trackAddToWishlist = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackAddToWishlist(cd, ud, eid);
export const trackCompleteRegistration = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackCompleteRegistration(cd, ud, eid);
export const trackContact = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackContact(cd, ud, eid);
export const trackCustomizeProduct = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackCustomizeProduct(cd, ud, eid);
export const trackDonate = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackDonate(cd, ud, eid);
export const trackFindLocation = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackFindLocation(cd, ud, eid);
export const trackInitiateCheckout = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackInitiateCheckout(cd, ud, eid);
export const trackLead = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackLead(cd, ud, eid);
export const trackPurchase = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackPurchase(cd, ud, eid);
export const trackSchedule = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackSchedule(cd, ud, eid);
export const trackSearch = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackSearch(cd, ud, eid);
export const trackStartTrial = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackStartTrial(cd, ud, eid);
export const trackSubmitApplication = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackSubmitApplication(cd, ud, eid);
export const trackSubscribe = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackSubscribe(cd, ud, eid);
export const trackViewContent = (cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackViewContent(cd, ud, eid);
export const trackCustom = (eventName: string, cd?: CustomData, ud?: UserData, eid?: string) => getTracker().trackCustom(eventName, cd, ud, eid);