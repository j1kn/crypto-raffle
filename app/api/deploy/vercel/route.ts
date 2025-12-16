import { NextRequest, NextResponse } from 'next/server';

// Vercel API token - should be in environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'gtiNGmtay57SEJHF77UwvE66';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'deploy' } = body;

    if (action === 'deploy') {
      // Get project
      const projectsRes = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
        },
      });

      const projects = await projectsRes.json();
      const project = projects.projects?.find((p: any) => 
        p.name === 'crypto-raffle' || p.name.includes('crypto')
      );

      if (!project) {
        // Create project
        const createRes = await fetch('https://api.vercel.com/v9/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'crypto-raffle',
            gitRepository: {
              type: 'github',
              repo: 'j1kn/crypto-raffle',
            },
          }),
        });

        const newProject = await createRes.json();
        return NextResponse.json({ success: true, project: newProject, created: true });
      }

      // Trigger deployment by redeploying latest
      // Since project is connected to GitHub, we can trigger a redeploy
      const latestDeployment = project.latestDeployments?.[0];
      
      if (latestDeployment) {
        // Redeploy existing deployment
        const deployRes = await fetch(`https://api.vercel.com/v13/deployments/${latestDeployment.id}/redeploy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        });

        const deployment = await deployRes.json();
        
        return NextResponse.json({
          success: true,
          deployment,
          url: deployment.url || latestDeployment.url,
          message: 'Redeployment triggered',
        });
      } else {
        // No existing deployment, trigger new one via GitHub
        return NextResponse.json({
          success: true,
          message: 'Project connected to GitHub. Push to main branch to deploy.',
          url: `https://${project.name}.vercel.app`,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Vercel deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Deployment failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get deployments
    const res = await fetch('https://api.vercel.com/v6/deployments', {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    const data = await res.json();
    return NextResponse.json({ success: true, deployments: data.deployments || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}

