import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const connectionInfo = {
    status: 'disconnected',
    connectionState: mongoose.connection.readyState,
    connectionStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      4: 'uninitialized'
    },
    host: process.env.MongoURL ? new URL(process.env.MongoURL).hostname : 'default',
    database: process.env.MongoURL ? new URL(process.env.MongoURL).pathname.replace(/^\//, '') : 'vecteno',
    connectionAttempts: 0,
    connectionTime: 0,
    mongoVersion: null,
    collections: []
  };

  try {
    console.log('Testing database connection...');
    const startConnect = Date.now();
    await connectToDatabase();
    connectionInfo.connectionTime = Date.now() - startConnect;
    
    // Get MongoDB server info
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    connectionInfo.status = 'connected';
    connectionInfo.connectionState = mongoose.connection.readyState;
    connectionInfo.mongoVersion = serverStatus.version;
    connectionInfo.collections = collections.map(c => c.name);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      connection: connectionInfo,
      responseTime: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString(),
      connection: {
        ...connectionInfo,
        status: 'failed',
        error: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      responseTime: `${Date.now() - startTime}ms`
    }, { 
      status: 500 
    });
  }
}