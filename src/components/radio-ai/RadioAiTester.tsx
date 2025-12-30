// components/radio-ai/RadioAiTester.tsx
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Brain, 
  Music, 
  Send,
  Loader,
  CheckCircle,
  XCircle,
  Heart,
  Star
} from 'lucide-react';
import radioAiService from '../../services/radio-ai/radioAiService';

// Types
interface MoodAnalysis {
  mood: string;
  intensity: number;
  confidence: number;
  reasoning?: string;
}

interface Track {
  audio_url: string;
  title: string;
  genre: string;
  duration: number;
}

interface Result {
  session_id: string;
  mood_analysis: MoodAnalysis;
  track: Track;
  from_cache: boolean;
  feedback_sent?: boolean;
  feedback?: {
    liked: boolean;
    rating: number;
  };
}

interface MoodExample {
  text: string;
  mood: string;
}

interface MoodAnalysisCardProps {
  analysis: MoodAnalysis;
}

interface MusicPlayerCardProps {
  track: Track;
}

const RadioAiTester: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [method, setMethod] = useState<string>('text');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const moodExamples: MoodExample[] = [
    { text: 'Me siento muy feliz hoy, es un día hermoso', mood: 'feliz' },
    { text: 'Estoy un poco triste, necesito algo que me anime', mood: 'triste' },
    { text: 'Tengo mucha energía, quiero música que me motive', mood: 'energico' },
    { text: 'Necesito relajarme después de un día estresante', mood: 'relajado' },
    { text: 'Estoy furioso, necesito descargar esta ira', mood: 'enojado' },
    { text: 'Me siento nostálgico, recordando tiempos pasados', mood: 'nostalgico' }
  ];

  const handleTest = async (): Promise<void> => {
    if (!input.trim()) {
      setError('Por favor ingresa un texto para analizar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await radioAiService.testMusicGeneration(input, method);
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (): void => {
    if (!result?.track?.audio_url) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      if (currentAudio) {
        currentAudio.play();
        setIsPlaying(true);
      } else {
        const audio = new Audio(result.track.audio_url);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        audio.addEventListener('error', () => {
          setError('Error reproduciendo audio');
          setIsPlaying(false);
        });
        
        setCurrentAudio(audio);
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFeedback = async (liked: boolean, rating: number): Promise<void> => {
    if (!result?.session_id) return;

    try {
      await radioAiService.submitFeedback(
        result.session_id,
        liked,
        rating,
        'Feedback desde panel admin'
      );
      
      setResult(prev => prev ? ({
        ...prev,
        feedback_sent: true,
        feedback: { liked, rating }
      }) : null);
    } catch (err) {
      setError(`Error enviando feedback: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const MoodAnalysisCard: React.FC<MoodAnalysisCardProps> = ({ analysis }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-purple-600" />
        Análisis de Estado de Ánimo
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Estado de Ánimo</label>
          <p className="text-lg font-bold text-purple-600 capitalize">
            {analysis.mood}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Intensidad</label>
          <p className="text-lg font-bold text-blue-600">
            {analysis.intensity}/10
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Confianza</label>
          <p className="text-lg font-bold text-green-600">
            {(analysis.confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Desde Cache</label>
          <p className="text-lg font-bold text-orange-600">
            {result?.from_cache ? 'Sí' : 'No'}
          </p>
        </div>
      </div>
      
      {analysis.reasoning && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Razonamiento</label>
          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
            {analysis.reasoning}
          </p>
        </div>
      )}
    </div>
  );

  const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({ track }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Music className="h-5 w-5 mr-2 text-pink-600" />
        Música Generada
      </h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handlePlayPause}
          className="flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{track.title}</h4>
          <p className="text-sm text-gray-500">
            {track.genre} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
          </p>
        </div>
        
        <Volume2 className="h-5 w-5 text-gray-400" />
      </div>
      
      {/* Feedback Section */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          ¿Cómo calificarías esta música?
        </p>
        
        {result?.feedback_sent ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">
              Feedback enviado: {result.feedback?.liked ? 'Me gusta' : 'No me gusta'} 
              ({result.feedback?.rating}/5 ⭐)
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFeedback(true, 5)}
              className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              <Heart className="h-4 w-4 mr-1" />
              Me gusta
            </button>
            <button
              onClick={() => handleFeedback(false, 2)}
              className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              <XCircle className="h-4 w-4 mr-1" />
              No me gusta
            </button>
            
            <div className="flex items-center space-x-1 ml-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFeedback(true, rating)}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  <Star className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Probador RADIO.ai</h1>
        <p className="text-pink-100 mt-2">
          Prueba la funcionalidad completa de análisis de ánimo y generación de música
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Entrada de Estado de Ánimo
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Entrada
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="text">Texto</option>
              <option value="voice">Voz (simulado)</option>
              <option value="selection">Selección</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe tu estado de ánimo
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Me siento muy feliz hoy, quiero música alegre..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleTest}
            disabled={loading || !input.trim()}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Generando...' : 'Generar Música'}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ejemplos de Estados de Ánimo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {moodExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => setInput(example.text)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300"
            >
              <p className="text-sm text-gray-700">{example.text}</p>
              <p className="text-xs text-purple-600 mt-1 capitalize font-medium">
                → {example.mood}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MoodAnalysisCard analysis={result.mood_analysis} />
          <MusicPlayerCard track={result.track} />
        </div>
      )}
    </div>
  );
};

export default RadioAiTester;