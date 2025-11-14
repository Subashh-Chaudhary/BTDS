import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IGoogleProfile } from 'src/common/interfaces';
import { SocialAuthService } from '../services/social-auth.service';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly socialAuthService;
    constructor(socialAuthService: SocialAuthService);
    validate(accessToken: string, refreshToken: string, profile: IGoogleProfile, done: VerifyCallback): Promise<void>;
}
export {};
