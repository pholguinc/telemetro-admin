import api from "./httpClient";

export const EducationService = {
  getAllCourses: async (params: Record<string, unknown> = {}) => {
    try {
      const safe = Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== undefined && v !== null && v !== ""
        )
      );
      const queryParams = new URLSearchParams(safe as Record<string, string>);
      const response = await api.get(`/microcourses?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCourse: async (courseId: string) => {
    const response = await api.get(`/microcourses/${courseId}`);
    return response.data;
  },
  createCourse: async (courseData: Record<string, unknown>) => {
    const response = await api.post("/admin/microcourses", courseData);
    return response.data;
  },
  updateCourse: async (
    courseId: string,
    courseData: Record<string, unknown>
  ) => {
    const response = await api.put(
      `/admin/microcourses/${courseId}`,
      courseData
    );
    return response.data;
  },
  deleteCourse: async (courseId: string) => {
    const response = await api.delete(`/admin/microcourses/${courseId}`);
    return response.data;
  },
  getGeneralStats: async () => {
    const response = await api.get("/microcourses/stats/general");
    return response.data;
  },
  getFeaturedCourses: async () => {
    const response = await api.get("/microcourses/featured/courses");
    return response.data;
  },
  getPopularCourses: async () => {
    const response = await api.get("/microcourses/popular/courses");
    return response.data;
  },
  getFreeCourses: async () => {
    const response = await api.get("/microcourses/free/courses");
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get("/microcourses/categories");
    return response.data;
  },
  getCourseEnrollments: async (courseId: string) => {
    const response = await api.get(
      `/admin/microcourses/${courseId}/enrollments`
    );
    return response.data;
  },
  getAllEnrollments: async (params: Record<string, unknown> = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/admin/enrollments?${queryParams}`);
    return response.data;
  },
  getCourseLessons: async (courseId: string) => {
    const response = await api.get(`/microcourses/${courseId}/lessons`);
    return response.data;
  },
  createLesson: async (
    courseId: string,
    lessonData: Record<string, unknown>
  ) => {
    const response = await api.post(
      `/admin/microcourses/${courseId}/lessons`,
      lessonData
    );
    return response.data;
  },
  updateLesson: async (
    courseId: string,
    lessonId: string,
    lessonData: Record<string, unknown>
  ) => {
    const response = await api.put(
      `/admin/microcourses/${courseId}/lessons/${lessonId}`,
      lessonData
    );
    return response.data;
  },
  deleteLesson: async (courseId: string, lessonId: string) => {
    const response = await api.delete(
      `/admin/microcourses/${courseId}/lessons/${lessonId}`
    );
    return response.data;
  },
  getLessonComments: async (
    lessonId: string,
    params: Record<string, unknown> = {}
  ) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(
      `/microcourses/lessons/${lessonId}/comments?${queryParams}`
    );
    return response.data;
  },
  moderateComment: async (commentId: string, action: string) => {
    const response = await api.post(`/admin/comments/${commentId}/${action}`);
    return response.data;
  },
  getCertificates: async (params: Record<string, unknown> = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await api.get(`/admin/certificates?${queryParams}`);
    return response.data;
  },
  issueCertificate: async (enrollmentId: string) => {
    const response = await api.post(
      `/admin/certificates/${enrollmentId}/issue`
    );
    return response.data;
  },
};
