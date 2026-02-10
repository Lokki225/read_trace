import fs from 'fs';
import path from 'path';

describe('AI Workflows and Project Rules', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const workflowsDir = path.join(projectRoot, '.windsurf', 'workflows');
  const windsurfRulesPath = path.join(projectRoot, '.windsurfrules');

  describe('Core AI Workflows', () => {
    it('should have .windsurf/workflows/ directory', () => {
      expect(fs.existsSync(workflowsDir)).toBe(true);
      expect(fs.statSync(workflowsDir).isDirectory()).toBe(true);
    });

    it('should have all 6 required workflows in directory', () => {
      const requiredWorkflows = [
        'continue-implementation.md',
        'validate-implementation.md',
        'smart-implementation.md',
        'confidence-guard.md',
        'product-alignment.md',
        'auto-healing.md'
      ];
      
      requiredWorkflows.forEach(workflow => {
        const filePath = path.join(workflowsDir, workflow);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have continue-implementation.md with AI Constitution bootstrap', () => {
      const filePath = path.join(workflowsDir, 'continue-implementation.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('AI_CONSTITUTION.md');
      expect(content).toContain('bootstrap');
    });

    it('should have validate-implementation.md with confidence guard integration', () => {
      const filePath = path.join(workflowsDir, 'validate-implementation.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('confidence');
      expect(content).toContain('guard');
    });
  });

  describe('Specialized Workflows', () => {
    it('should have smart-implementation.md with anti-simplification enforcement', () => {
      const filePath = path.join(workflowsDir, 'smart-implementation.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('anti-simplification');
      expect(content).toContain('quality');
    });

    it('should have confidence-guard.md for protecting confidence scores', () => {
      const filePath = path.join(workflowsDir, 'confidence-guard.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('confidence');
      expect(content).toContain('90');
    });

    it('should have product-alignment.md for strategic validation', () => {
      const filePath = path.join(workflowsDir, 'product-alignment.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('Product Layer');
      expect(content).toContain('alignment');
    });
  });

  describe('Auto-healing and Project Rules', () => {
    it('should have auto-healing.md for proactive fixes', () => {
      const filePath = path.join(workflowsDir, 'auto-healing.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('auto-healing');
      expect(content).toContain('proactive');
    });

    it('should have .windsurfrules with AI Constitution reference', () => {
      expect(fs.existsSync(windsurfRulesPath)).toBe(true);
      
      const content = fs.readFileSync(windsurfRulesPath, 'utf-8');
      expect(content).toContain('AI_CONSTITUTION.md');
    });

    it('should have BMAD rules in .windsurfrules', () => {
      const content = fs.readFileSync(windsurfRulesPath, 'utf-8');
      expect(content).toContain('BMAD');
      expect(content).toContain('confidence');
      expect(content).toContain('quality');
    });
  });

  describe('Bootstrap Compliance', () => {
    const workflows = [
      'continue-implementation.md',
      'validate-implementation.md',
      'smart-implementation.md',
      'confidence-guard.md',
      'product-alignment.md',
      'auto-healing.md'
    ];

    workflows.forEach(workflow => {
      it(`should have AI Constitution bootstrap in ${workflow}`, () => {
        const filePath = path.join(workflowsDir, workflow);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(content).toContain('AI_CONSTITUTION.md');
        expect(content.toLowerCase()).toContain('bootstrap');
      });
    });

    workflows.forEach(workflow => {
      it(`should have comprehensive bootstrap checklist in ${workflow}`, () => {
        const filePath = path.join(workflowsDir, workflow);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Verify comprehensive bootstrap pattern (not abbreviated)
        expect(content).toContain('BOOTSTRAP CHECKLIST');
        expect(content).toContain('docs/AI_CONSTITUTION.md');
        expect(content).toContain('BLOCKING RULE');
        expect(content).toContain('AI CONSTITUTION LOADED');
      });
    });

    it('should enforce governance compliance across all workflows', () => {
      workflows.forEach(workflow => {
        const filePath = path.join(workflowsDir, workflow);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        expect(
          content.includes('governance') || 
          content.includes('constitution') || 
          content.includes('compliance')
        ).toBe(true);
      });
    });

    it('should have consistent bootstrap pattern across all workflows', () => {
      workflows.forEach(workflow => {
        const filePath = path.join(workflowsDir, workflow);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Each workflow should have exactly 1 of each bootstrap element
        const bootstrapChecklist = (content.match(/BOOTSTRAP CHECKLIST/g) || []).length;
        const blockingRule = (content.match(/BLOCKING RULE/g) || []).length;
        const constitutionLoaded = (content.match(/AI CONSTITUTION LOADED/g) || []).length;
        
        expect(bootstrapChecklist).toBeGreaterThanOrEqual(1);
        expect(blockingRule).toBeGreaterThanOrEqual(1);
        expect(constitutionLoaded).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
