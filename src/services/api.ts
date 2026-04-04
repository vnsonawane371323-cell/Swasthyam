import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  errors?: Record<string, string>;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bmr?: number;
  activityLevel?: string;
  activityFactor?: number;
  tdee?: number;
  calorieGoal?: 'maintain' | 'lose' | 'gain';
  adjustedTdee?: number;
  medicalHistory?: Array<{ condition: string; severity: string }>;
  mealsPerDay?: string;
  frequencyToEatOutside?: string;
  foodieLevel?: string;
  dietaryPreference?: string;
  preferredCookingStyle?: string;
  currentOils?: string[];
  monthlyOilConsumption?: number;
  oilBudget?: string;
  language?: string;
  isOnboardingComplete?: boolean;
  onboardingStep?: number;
  dailyOilLimit?: number;
  healthRiskLevel?: number;
  avatar?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bmr?: number;
  activityLevel?: string;
  activityFactor?: number;
  tdee?: number;
  calorieGoal?: 'maintain' | 'lose' | 'gain';
  adjustedTdee?: number;
  medicalHistory?: Array<{ condition: string; severity: string }>;
  reportType?: string;
  mealsPerDay?: string;
  frequencyToEatOutside?: string;
  foodieLevel?: string;
  dietaryPreference?: string;
  preferredCookingStyle?: string;
  currentOils?: string[];
  monthlyOilConsumption?: number;
  oilBudget?: string;
}

export interface FoodNutritionData {
  foodName: string;
  oilContent: {
    totalOil: string;
    oilType: string;
    estimatedMl: number;
    calories: number;
  };
  fatBreakdown: {
    saturatedFat: string;
    transFat: string;
    polyunsaturatedFat: string;
    monounsaturatedFat: string;
  };
  healthScore: number;
  healthTips: string[];
  servingSize: string;
  cookingMethod: string;
  isHealthy: boolean;
}

class ApiService {
  private token: string | null = null;
  private timeout: number = 45000; // 45 second timeout for slower mobile networks

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[API] Calling: ${url}`); // Debug log
    console.log(`[API] Has token: ${!!this.token}`); // Debug auth status
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log(`[API] Authorization header set`);
    } else {
      console.warn(`[API] WARNING: No token available for authenticated endpoint`);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log(`[API] Response status: ${response.status}`, data); // Debug log

      if (!response.ok) {
                // Log 401 errors specifically
                if (response.status === 401) {
                  console.error(`[API] 401 Unauthorized - Token may be invalid or expired`);
                  console.error(`[API] Full error response:`, data);
                }
        
        return {
          success: false,
          message: data.message || 'An error occurred',
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[API] Request error:', error);
      
      // Check if it's a timeout/abort error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: `Request timed out after ${Math.round(this.timeout / 1000)}s. Ensure backend is running and reachable at ${API_BASE_URL}.`,
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      };
    }
  }

  // Generic POST method for FormData
  async post<T>(
    endpoint: string,
    data: FormData | Record<string, any>,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] POST: ${url}`);

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData, let the browser set it
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    } else {
      delete headers['Content-Type'];
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const body = isFormData ? data : JSON.stringify(data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        ...options,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();
      console.log(`[API] Response:`, responseData);

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || 'An error occurred',
          errors: responseData.errors,
        };
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[API] Request error:', error);

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: `Request timed out after ${Math.round(this.timeout / 1000)}s. Ensure backend is running and reachable at ${API_BASE_URL}.`,
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      };
    }
  }

  // Auth endpoints
  async signup(data: SignupData): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(data: OnboardingData): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.COMPLETE_ONBOARDING, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  }

  // Family member endpoints
  async searchUsers(query: string): Promise<ApiResponse<Array<{ _id: string; email: string; name: string; avatar?: string }>>> {
    return this.request(`${API_ENDPOINTS.AUTH.SEARCH_USERS}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async getFamilyMembers(): Promise<ApiResponse<FamilyMember[]>> {
    return this.request<FamilyMember[]>(API_ENDPOINTS.AUTH.FAMILY, {
      method: 'GET',
    });
  }

  async addFamilyMember(userId: string, relation: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.FAMILY, {
      method: 'POST',
      body: JSON.stringify({ userId, relation }),
    });
  }

  async removeFamilyMember(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`${API_ENDPOINTS.AUTH.FAMILY}/${userId}`, {
      method: 'DELETE',
    });
  }

  // Update current oil
  async updateCurrentOil(oilType: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify({ currentOils: [oilType] }),
    });
  }

  // Oil consumption endpoints
  async logOilConsumption(data: OilConsumptionLog): Promise<ApiResponse<LogOilConsumptionResponse>> {
    return this.request<LogOilConsumptionResponse>(API_ENDPOINTS.OIL.LOG, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOilEntries(params?: { startDate?: string; endDate?: string; limit?: number; page?: number }): Promise<ApiResponse<OilEntriesResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.OIL.ENTRIES}?${queryString}` : API_ENDPOINTS.OIL.ENTRIES;
    
    return this.request<OilEntriesResponse>(endpoint, {
      method: 'GET',
    });
  }

  async getTodayOilConsumption(date?: string): Promise<ApiResponse<TodayConsumptionResponse>> {
    const endpoint = date ? `${API_ENDPOINTS.OIL.TODAY}?date=${encodeURIComponent(date)}` : API_ENDPOINTS.OIL.TODAY;
    console.log('🛢️ [API] getTodayOilConsumption endpoint:', endpoint);
    const response = await this.request<TodayConsumptionResponse>(endpoint, {
      method: 'GET',
    });
    console.log('🛢️ [API] getTodayOilConsumption response:', JSON.stringify(response, null, 2));
    return response;
  }

  async getUserOilStatus(date?: string): Promise<ApiResponse<UserOilStatusResponse>> {
    const endpoint = date ? `${API_ENDPOINTS.OIL.USER_STATUS}?date=${encodeURIComponent(date)}` : API_ENDPOINTS.OIL.USER_STATUS;
    return this.request<UserOilStatusResponse>(endpoint, {
      method: 'GET',
    });
  }

  async analyzeFoodImage(base64Image: string): Promise<ApiResponse<FoodNutritionData>> {
    return this.request<FoodNutritionData>(API_ENDPOINTS.OIL.ANALYZE_FOOD, {
      method: 'POST',
      body: JSON.stringify({ base64Image }),
    });
  }

  async getWeeklyOilStats(): Promise<ApiResponse<WeeklyStat[]>> {
    return this.request<WeeklyStat[]>(API_ENDPOINTS.OIL.WEEKLY_STATS, {
      method: 'GET',
    });
  }

  async updateOilEntry(id: string, data: Partial<OilConsumptionLog>): Promise<ApiResponse<OilMutationResponse>> {
    return this.request<OilMutationResponse>(`${API_ENDPOINTS.OIL.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOilEntry(id: string): Promise<ApiResponse<OilTotalsSummary>> {
    return this.request<OilTotalsSummary>(`${API_ENDPOINTS.OIL.DELETE}/${id}`, {
      method: 'DELETE',
    });
  }

  // Group management endpoints
  async createGroup(data: CreateGroupData): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyGroups(): Promise<ApiResponse<Group[]>> {
    return this.request<Group[]>(API_ENDPOINTS.GROUPS.BASE, {
      method: 'GET',
    });
  }

  async getPendingInvitations(): Promise<ApiResponse<Group[]>> {
    return this.request<Group[]>(API_ENDPOINTS.GROUPS.INVITATIONS, {
      method: 'GET',
    });
  }

  async getAdminGroups(): Promise<ApiResponse<Group[]>> {
    return this.request<Group[]>(API_ENDPOINTS.GROUPS.ADMIN, {
      method: 'GET',
    });
  }

  async getGroup(groupId: string): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.DETAIL(groupId), {
      method: 'GET',
    });
  }

  async inviteMembers(groupId: string, userIds: string[]): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.GROUPS.INVITE(groupId), {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  async acceptInvitation(groupId: string): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.ACCEPT(groupId), {
      method: 'POST',
    });
  }

  async rejectInvitation(groupId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.GROUPS.REJECT(groupId), {
      method: 'POST',
    });
  }

  async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.GROUPS.LEAVE(groupId), {
      method: 'POST',
    });
  }

  async removeMember(groupId: string, userId: string): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, userId), {
      method: 'DELETE',
    });
  }

  async promoteMember(groupId: string, userId: string): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.PROMOTE(groupId, userId), {
      method: 'POST',
    });
  }

  async updateGroup(groupId: string, data: Partial<CreateGroupData>): Promise<ApiResponse<Group>> {
    return this.request<Group>(API_ENDPOINTS.GROUPS.UPDATE(groupId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(groupId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.GROUPS.DELETE(groupId), {
      method: 'DELETE',
    });
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`${API_ENDPOINTS.GROUPS.SEARCH_USERS}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }

  async logGroupConsumption(groupId: string, consumptionData: GroupConsumptionItem[]): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.OIL.LOG_GROUP, {
      method: 'POST',
      body: JSON.stringify({ groupId, consumptionData }),
    });
  }
}

export interface FamilyMember {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  relation: string;
  addedAt: string;
  dailyOilLimit?: number;
}

export interface OilConsumptionLog {
  foodName: string;
  oilType: string;
  oilAmount: number;
  oilAmountUnit?: 'ml' | 'g';
  totalCalories?: number;
  quantity: number;
  unit: 'grams' | 'bowls' | 'pieces';
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  members?: string[];
  consumedAt?: string;
}

export interface OilConsumptionEntry extends OilConsumptionLog {
  _id: string;
  userId: string;
  rawKcal?: number;
  multiplier?: number;
  effectiveKcal?: number;
  consumedAt: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OilTotalsSummary {
  dailyTotal: number;
  dailyTotalCalories?: number;
  dailyOilCalories?: number;
  dailyEffectiveCalories?: number;
}

export interface OilMutationResponse extends OilTotalsSummary {
  entry?: OilConsumptionEntry;
}

export interface LogOilConsumptionResponse extends OilMutationResponse {
  eventId?: string;
  rawKcal?: number;
  multiplier?: number;
  effectiveKcal?: number;
  goalKcal?: number;
  goalMl?: number;
  cumulativeEffKcal?: number;
  remainingKcal?: number;
  remainingMl?: number;
  fillPercent?: number;
  overage?: number;
  eventsCount?: number;
  status?: 'within_limit' | 'over_limit';
}

export interface OilEntriesResponse {
  entries: OilConsumptionEntry[];
  dailyTotal: number;
  dailyTotalCalories?: number;
  dailyOilCalories?: number;
  dailyEffectiveCalories?: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TodayConsumptionResponse {
  entries: OilConsumptionEntry[];
  dailyTotal: number;
  dailyTotalCalories?: number;
  dailyOilCalories?: number;
  dailyEffectiveCalories?: number;
  count: number;
}

export interface WeeklyStat {
  _id: string;
  totalOil: number;
  totalCalories?: number;
  entries: number;
}

export interface UserOilStatusResponse {
  userId: string;
  date: string;
  goalKcal: number;
  goalMl: number;
  cumulativeEffKcal: number;
  remainingKcal: number;
  remainingMl: number;
  fillPercent: number;
  overage: number;
  eventsCount: number;
  status: 'within_limit' | 'over_limit';
}

export interface GroupMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  joinedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  type: 'family' | 'school' | 'community' | 'other';
  admin: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: GroupMember[];
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    autoShareConsumption: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  type?: 'family' | 'school' | 'community' | 'other';
  settings?: {
    allowMemberInvites?: boolean;
    requireApproval?: boolean;
    autoShareConsumption?: boolean;
  };
}

export interface GroupConsumptionItem {
  userId: string;
  foodName: string;
  oilType: string;
  oilAmount: number;
  quantity: number;
  unit: 'grams' | 'bowls' | 'pieces';
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  consumedAt?: string;
}

export const apiService = new ApiService();
export default apiService;
