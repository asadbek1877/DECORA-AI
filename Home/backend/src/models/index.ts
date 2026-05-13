import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignProject {
  id: string;
  userId: string;
  originalImageUrl: string;
  originalImagePath: string;
  style?: string;
  previewImages: PreviewImage[];
  finalImageUrl?: string;
  finalImagePath?: string;
  status: 'uploaded' | 'previewing' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviewImage {
  id: string;
  styleName: string;
  imageUrl: string;
  imagePath: string;
}

export interface DesignStyle {
  name: string;
  displayName: string;
  colorPalette: string[];
  lightingMood: string;
  furnitureType: string;
  materials: string[];
  cameraPerspective: string;
  description: string;
  thumbnailUrl?: string;
}

// In-memory storage (replace with DB in production)
class Database {
  private users: Map<string, User> = new Map();
  private projects: Map<string, DesignProject> = new Map();

  // Users
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Projects
  async createProject(data: Omit<DesignProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<DesignProject> {
    const project: DesignProject = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  async findProjectById(id: string): Promise<DesignProject | undefined> {
    return this.projects.get(id);
  }

  async findProjectsByUserId(userId: string): Promise<DesignProject[]> {
    return Array.from(this.projects.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateProject(id: string, data: Partial<DesignProject>): Promise<DesignProject | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...data, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const db = new Database();
