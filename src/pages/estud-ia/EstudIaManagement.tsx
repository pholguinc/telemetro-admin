import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Brain,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


// Types
interface Course {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  status: 'borrador' | 'generando' | 'publicado' | 'archivado';
  estimatedDuration: number;
  enrollmentCount?: number;
  completionCount?: number;
  aiGenerated?: boolean;
}

interface Stats {
  courses?: {
    total: number;
    active: number;
  };
  enrollments?: {
    total: number;
    completed: number;
    completionRate: string;
  };
  certificates?: {
    issued: number;
  };
}

interface Category {
  value: string;
  label: string;
}

interface Difficulty {
  value: 'principiante' | 'intermedio' | 'avanzado';
  label: string;
}

interface FormData {
  topic: string;
  category: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  targetAudience: string[];
  estimatedDuration: number;
  language: string;
  includeQuizzes: boolean;
  voiceId: string;
}

interface GenerateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  difficulties: Difficulty[];
}

const EstudIaManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);

  const categories: Category[] = [
    { value: 'publicidad', label: 'Publicidad' },
    { value: 'idiomas', label: 'Idiomas' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'marketing_digital', label: 'Marketing Digital' },
    { value: 'desarrollo_personal', label: 'Desarrollo Personal' },
    { value: 'finanzas_personales', label: 'Finanzas Personales' },
    { value: 'emprendimiento', label: 'Emprendimiento' },
    { value: 'comunicacion', label: 'Comunicación' },
    { value: 'liderazgo', label: 'Liderazgo' },
    { value: 'productividad', label: 'Productividad' },
    { value: 'arte_creatividad', label: 'Arte y Creatividad' },
    { value: 'salud_bienestar', label: 'Salud y Bienestar' },
    { value: 'ciencias', label: 'Ciencias' },
    { value: 'historia_cultura', label: 'Historia y Cultura' }
  ];

  const difficulties: Difficulty[] = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' }
  ];

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch('/api/estud-ia/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error al cargar estadísticas');
    }
  };

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      params.append('limit', '50');

      const response = await fetch(`/api/estud-ia/courses?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    fetchCourses();
  };

  const getStatusBadge = (status: Course['status']): JSX.Element => {
    const statusConfig: Record<Course['status'], { color: string; label: string }> = {
      'borrador': { color: 'bg-gray-500', label: 'Borrador' },
      'generando': { color: 'bg-blue-500', label: 'Generando' },
      'publicado': { color: 'bg-green-500', label: 'Publicado' },
      'archivado': { color: 'bg-red-500', label: 'Archivado' }
    };

    const config = statusConfig[status] || statusConfig['borrador'];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: Course['difficulty']): JSX.Element => {
    const difficultyConfig: Record<Course['difficulty'], { color: string; label: string }> = {
      'principiante': { color: 'bg-green-100 text-green-800', label: 'Principiante' },
      'intermedio': { color: 'bg-yellow-100 text-yellow-800', label: 'Intermedio' },
      'avanzado': { color: 'bg-red-100 text-red-800', label: 'Avanzado' }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig['principiante'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCategory = (category: string): string => {
    const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
      acc[cat.value] = cat.label;
      return acc;
    }, {});
    return categoryMap[category] || category;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ESTUD.IA</h1>
          <p className="text-gray-600">Plataforma de educación con inteligencia artificial</p>
        </div>
        <Button 
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generar Curso con IA
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold">{stats.courses?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold">{stats.courses?.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Inscripciones</p>
                <p className="text-2xl font-bold">{stats.enrollments?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold">{stats.enrollments?.completed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Certificados</p>
                <p className="text-2xl font-bold">{stats.certificates?.issued || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa Finalización</p>
                <p className="text-2xl font-bold">{stats.enrollments?.completionRate || '0%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las dificultades</option>
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>

            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos Generados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Curso</th>
                    <th className="text-left py-3 px-4">Categoría</th>
                    <th className="text-left py-3 px-4">Dificultad</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Duración</th>
                    <th className="text-left py-3 px-4">Inscripciones</th>
                    <th className="text-left py-3 px-4">Completados</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {course.shortDescription}
                          </p>
                          {course.aiGenerated && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                              <Brain className="w-3 h-3 mr-1" />
                              IA
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {formatCategory(course.category)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getDifficultyBadge(course.difficulty)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(course.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.estimatedDuration} min
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {course.enrollmentCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {course.completionCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {courses.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron cursos</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Course Modal */}
      {showGenerateModal && (
        <GenerateCourseModal 
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            fetchCourses();
            fetchStats();
          }}
          categories={categories}
          difficulties={difficulties}
        />
      )}
    </div>
  );
};

// Modal para generar curso
const GenerateCourseModal: React.FC<GenerateCourseModalProps> = ({ 
  onClose, 
  onSuccess, 
  categories, 
  difficulties 
}) => {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    category: '',
    difficulty: 'principiante',
    targetAudience: [''],
    estimatedDuration: 15,
    language: 'es',
    includeQuizzes: true,
    voiceId: ''
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/estud-ia/courses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          targetAudience: formData.targetAudience.filter(audience => audience.trim())
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Curso en proceso de generación');
        onSuccess();
      } else {
        toast.error(data.error || 'Error generando curso');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error interno del servidor');
    } finally {
      setLoading(false);
    }
  };

  const addTargetAudience = (): void => {
    setFormData(prev => ({
      ...prev,
      targetAudience: [...prev.targetAudience, '']
    }));
  };

  const updateTargetAudience = (index: number, value: string): void => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.map((item, i) => i === index ? value : item)
    }));
  };

  const removeTargetAudience = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generar Curso con IA</h2>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tema del Curso *</label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Ej: Fundamentos de Marketing Digital para Emprendedores"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dificultad *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as FormData['difficulty']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audiencia Objetivo *</label>
            {formData.targetAudience.map((audience, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={audience}
                  onChange={(e) => updateTargetAudience(index, e.target.value)}
                  placeholder="Ej: Emprendedores principiantes"
                />
                {formData.targetAudience.length > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => removeTargetAudience(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTargetAudience}>
              + Agregar audiencia
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duración Estimada: {formData.estimatedDuration} minutos
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                estimatedDuration: parseInt(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeQuizzes"
              checked={formData.includeQuizzes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                includeQuizzes: e.target.checked 
              }))}
            />
            <label htmlFor="includeQuizzes" className="text-sm">
              Incluir quizzes interactivos
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generando...' : 'Generar Curso'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EstudIaManagement;