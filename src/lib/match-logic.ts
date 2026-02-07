import { FreelancerProfile } from "@/types";

/**
 * Ranks freelancers based on skill match and platform reputation.
 * @param jobSkills Skills required for the job
 * @param allFreelancers List of all available freelancers
 * @returns Top 5 suggested freelancers
 */
export function getSuggestedFreelancers(jobSkills: string[] = [], allFreelancers: FreelancerProfile[]) {
    // 1. Eligibility Gating (Defensive Layer)
    const eligible = allFreelancers.filter(profile => {
        const isVerified = profile.verified === true;
        const isVisible = profile.visibility === 'normal' || profile.visibility === 'limited';
        const isVettingPassed = (profile.metrics?.completionRate || 100) >= 80 && (profile.metrics?.disputeCount || 0) < 3;
        const isAvailable = profile.available !== false;

        return isVerified && isVisible && isVettingPassed && isAvailable;
    });

    if (!eligible.length) return [];

    const scored = eligible.map(profile => {
        // 2. Skill Match Score (70% weight)
        const commonSkills = profile.skills.filter(skill =>
            jobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
        );
        const skillScore = jobSkills.length > 0 ? (commonSkills.length / jobSkills.length) * 100 : 0;

        // 3. Reputation & Behavior Score (20% weight)
        const reputationScore = (profile.rating || 0) * 10 + (profile.metrics?.successScore || 0);

        // 4. Recency Boost (10% weight)
        // Bonus for activity in the last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recencyScore = profile.lastActiveAt && profile.lastActiveAt > thirtyDaysAgo ? 100 : 50;

        // Soft penalty for 'limited' visibility
        const visibilityPenalty = profile.visibility === 'limited' ? 0.5 : 1.0;

        // Weighted total
        const totalScore = ((skillScore * 0.7) + (reputationScore * 0.2) + (recencyScore * 0.1)) * visibilityPenalty;

        return { profile, totalScore };
    });

    // Sort by descending score
    return scored
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5)
        .map(s => s.profile);
}
