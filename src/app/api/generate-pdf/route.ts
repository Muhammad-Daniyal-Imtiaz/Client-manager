// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// For jspdf v3.x and jspdf-autotable v5.x, no need to extend the prototype
// The autoTable function is automatically available on jsPDF instances

interface SEOTask {
  id: string;
  name: string;
  assigned_to: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  estimated_hours?: number;
}

interface SEOPhase {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  tasks: SEOTask[];
}

interface SEOProject {
  id: string;
  name: string;
  client_name: string;
  website_url?: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  start_date?: string;
  target_completion_date?: string;
  phases: SEOPhase[];
}

export async function POST(request: NextRequest) {
  try {
    const project: SEOProject = await request.json();
    
    if (!project) {
      return NextResponse.json(
        { message: 'No project data provided' },
        { status: 400 }
      );
    }

    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${project.name} - SEO Project Report`,
      subject: 'SEO Project Report',
      author: 'SEO Checklist Manager',
      keywords: 'seo, project, report, checklist',
      creator: 'SEO Checklist Manager'
    });
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(project.name, 105, 20, { align: 'center' });
    
    // Add client name
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Client: ${project.client_name}`, 105, 30, { align: 'center' });
    
    // Add project details
    doc.setFontSize(12);
    let yPosition = 45;
    
    // Project status
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Status:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(project.status, 60, yPosition);
    yPosition += 8;
    
    // Website URL
    if (project.website_url) {
      doc.setFont('helvetica', 'bold');
      doc.text('Website:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(project.website_url, 45, yPosition);
      yPosition += 8;
    }
    
    // Dates
    if (project.start_date) {
      doc.setFont('helvetica', 'bold');
      doc.text('Start Date:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(project.start_date).toLocaleDateString(), 45, yPosition);
      yPosition += 8;
    }
    
    if (project.target_completion_date) {
      doc.setFont('helvetica', 'bold');
      doc.text('Target Completion:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(project.target_completion_date).toLocaleDateString(), 60, yPosition);
      yPosition += 8;
    }
    
    // Description
    if (project.description) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 20, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      
      // Split description into lines that fit the page width
      const splitDescription = doc.splitTextToSize(project.description, 170);
      doc.text(splitDescription, 20, yPosition);
      yPosition += splitDescription.length * 6 + 10;
    } else {
      yPosition += 15;
    }
    
    // Add phases and tasks
    if (project.phases && project.phases.length > 0) {
      // Add phases header
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Project Phases & Tasks', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Process each phase
      for (const phase of project.phases) {
        // Add phase name
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 150);
        doc.text(phase.name, 20, yPosition);
        yPosition += 10;
        
        // Add phase description if exists
        if (phase.description) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const splitPhaseDesc = doc.splitTextToSize(phase.description, 170);
          doc.text(splitPhaseDesc, 20, yPosition);
          yPosition += splitPhaseDesc.length * 5 + 5;
        }
        
        // Add phase status
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text(`Status: ${phase.status}`, 20, yPosition);
        yPosition += 7;
        
        // Check if we need a new page
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add tasks table if phase has tasks
        if (phase.tasks && phase.tasks.length > 0) {
          const tableData = phase.tasks.map((task) => [
            task.name || 'Unnamed Task',
            task.assigned_to || 'Unassigned',
            task.status || 'Not Started',
            task.priority || 'Medium',
            task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
            task.estimated_hours ? task.estimated_hours.toString() : 'N/A'
          ]);
          
          // Use autoTable plugin - the API has changed in v5
          autoTable(doc, {
            startY: yPosition,
            head: [['Task', 'Assigned To', 'Status', 'Priority', 'Due Date', 'Est. Hours']],
            body: tableData,
            theme: 'grid',
            headStyles: {
              fillColor: [66, 135, 245],
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240]
            },
            styles: {
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              cellWidth: 'wrap'
            },
            margin: { left: 20, right: 20 },
            tableWidth: 'auto'
          });
          
          // Get the final Y position after the table
          const finalY = (doc as any).lastAutoTable.finalY;
          if (finalY) {
            yPosition = finalY + 15;
          } else {
            yPosition += 100; // Fallback if finalY is not available
          }
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No tasks in this phase', 20, yPosition);
          yPosition += 10;
        }
        
        // Add some space between phases
        yPosition += 5;
        
        // Check if we need a new page before next phase
        if (yPosition > 240 && phase !== project.phases[project.phases.length - 1]) {
          doc.addPage();
          yPosition = 20;
        }
      }
    }
    
    // Add footer with generation date
    const totalPages = doc.internal.pages.length - 1;
    const generationDate = new Date().toLocaleDateString();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${generationDate} • Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
    }
    
    // Get the PDF as a buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Create response
    const response = new NextResponse(pdfBuffer);
    
    // Set response headers
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${project.name.replace(/\s+/g, '_')}_Report.pdf"`);
    response.headers.set('Content-Length', pdfBuffer.length.toString());
    
    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { 
        message: 'Error generating PDF',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to generate PDF.' },
    { status: 405 }
  );
}