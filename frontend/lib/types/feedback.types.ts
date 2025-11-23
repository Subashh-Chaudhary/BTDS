export interface FeedbackExpert {
    id: string;
    name: string;
    email: string;
    hospital_name: string | null;
    specialization: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_active: boolean;
}

export interface FeedbackItem {
    id: string;
    scan_id: string;
    expert_id: string;
    report_id: string;
    feedback_text: string;
    verified_at: string;
    expert: FeedbackExpert;
    scan: {
        id: string;
        image_url: string;
        uploaded_at: string;
    };
    report: {
        id: string;
        is_verified: boolean;
        generated_at: string;
    };
}

export interface FeedbackResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: FeedbackItem[];
    meta: {
        timestamp: string;
        path: string;
        method: string;
    };
}
