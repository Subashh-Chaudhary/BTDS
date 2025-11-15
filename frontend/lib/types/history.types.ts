export interface HistoryItem {
  id: string;
  viewed_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    age: number | null;
    gender: string | null;
    is_verified: boolean;
    is_active: boolean;
    verification_token: string;
    verification_token_expires_at: string;
    password_reset_token: string | null;
    reset_token_expires_at: string | null;
    refresh_token: string | null;
    refresh_token_expires_at: string | null;
    last_login_at: string | null;
    auth_provider: string | null;
    provider_id: string | null;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
  };
  report: {
    id: string;
    feedback_id: string;
    report_url: string | null;
    generated_at: string;
    created_at: string;
    updated_at: string;
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      phone: string | null;
      address: string | null;
      avatar_url: string | null;
      age: number | null;
      gender: string | null;
      is_verified: boolean;
      is_active: boolean;
      verification_token: string;
      verification_token_expires_at: string;
      password_reset_token: string | null;
      reset_token_expires_at: string | null;
      refresh_token: string | null;
      refresh_token_expires_at: string | null;
      last_login_at: string | null;
      auth_provider: string | null;
      provider_id: string | null;
      is_admin: boolean;
      created_at: string;
      updated_at: string;
    };
    scan: {
      id: string;
      image_url: string;
      user_id: string;
      model_prediction_id: string;
      uploaded_at: string;
    };
    prediction: {
      id: string;
      tumor_type: string;
      confidence_score: number;
      description: string;
      output_image_url: string;
      created_at: string;
      updated_at: string;
    };
    treatment: null;
  };
}

export interface HistoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: HistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
}