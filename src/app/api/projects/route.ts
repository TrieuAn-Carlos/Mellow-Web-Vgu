import { NextResponse } from 'next/server';
import { mockDb } from "@/lib/mockDatabase";

export async function GET() {
  const projects = mockDb.getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.color) {
    return NextResponse.json({ message: 'Project name and color are required' }, { status: 400 });
  }
  const newProject = mockDb.addProject({ name: body.name, color: body.color, description: body.description || '' });
  return NextResponse.json(newProject, { status: 201 });
} 