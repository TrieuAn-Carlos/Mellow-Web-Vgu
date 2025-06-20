import { NextResponse, NextRequest } from 'next/server';
import { mockDb } from "@/lib/mockDatabase";

// GET /api/dailies?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ message: "Valid date query parameter (YYYY-MM-DD) is required." }, { status: 400 });
  }

  const tasks = mockDb.getDailiesForDate(date);
  return NextResponse.json(tasks);
}

// POST /api/dailies?date=YYYY-MM-DD
export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) return NextResponse.json({ message: "Date query parameter is required." }, { status: 400 });

    const body = await request.json();
    const newTask = mockDb.addTaskToDate(date, body);
    return NextResponse.json(newTask, { status: 201 });
}

// PUT /api/dailies?date=YYYY-MM-DD&taskId=...
export async function PUT(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const taskId = searchParams.get('taskId');
    if (!date || !taskId) return NextResponse.json({ message: "Date and taskId query parameters are required." }, { status: 400 });

    const updates = await request.json();
    const updatedTask = mockDb.updateTask(date, taskId, updates);
    if (!updatedTask) return NextResponse.json({ message: "Task not found." }, { status: 404 });

    return NextResponse.json(updatedTask);
}

// DELETE /api/dailies?date=YYYY-MM-DD&taskId=...
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const taskId = searchParams.get('taskId');
    if (!date || !taskId) return NextResponse.json({ message: "Date and taskId query parameters are required." }, { status: 400 });

    const success = mockDb.deleteTask(date, taskId);
    if (!success) return NextResponse.json({ message: "Task not found." }, { status: 404 });

    return new NextResponse(null, { status: 204 });
} 