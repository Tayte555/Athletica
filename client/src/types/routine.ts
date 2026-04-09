export type Exercise = {
  _id: string;
  name: string;
  muscleGroup: string;
  equipment: string[];
  description: string;
  image?: string;
  instructions?: string[];
  isSystem?: boolean;
};

export type CustomExercise = {
  name: string;
  muscleGroup: string;
  equipment: string[];
  description: string;
  image?: string;
  instructions?: string[];
};

export type RoutineExercise = {
  exercise?: Exercise | null;
  customExercise?: CustomExercise | null;
  exerciseData?: Exercise | CustomExercise | null;
  exerciseSource?: "library" | "custom";
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
};

export type Routine = {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  durationMinutes: number;
  focus: string;
  workoutType: string;
  targetMuscles: string[];
  equipment: string[];
  tags: string[];
  notes: string;
  image?: string;
  isPublic: boolean;
  createdBy?: {
    _id?: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  exercises: RoutineExercise[];
  savedByCount?: number;
  isSaved?: boolean;
  isOwner?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
