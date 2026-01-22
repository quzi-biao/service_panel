const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_PATH = '/Users/zhengbiaoxie/Workspace';
const API_BASE_URL = 'http://localhost:3004/api';

function isGitRepository(projectPath) {
  return fs.existsSync(path.join(projectPath, '.git'));
}

function getGitRemoteUrl(projectPath) {
  try {
    const url = execSync('git config --get remote.origin.url', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    return url || null;
  } catch (error) {
    return null;
  }
}

function detectProjectType(projectPath, projectName) {
  const files = fs.readdirSync(projectPath);
  
  // Check for package.json (Node.js/JavaScript projects)
  if (files.includes('package.json')) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['react'] || deps['react-dom']) return '前端项目-React';
      if (deps['vue']) return '前端项目-Vue';
      if (deps['next']) return '前端项目-Next.js';
      if (deps['express']) return '后端服务-Node.js';
      if (deps['@nestjs/core']) return '后端服务-NestJS';
      if (deps['electron']) return '桌面应用-Electron';
      return '前端项目';
    } catch (e) {
      return '前端项目';
    }
  }
  
  // Check for Python projects
  if (files.includes('requirements.txt') || files.includes('setup.py') || files.includes('pyproject.toml')) {
    if (files.includes('manage.py')) return '后端服务-Django';
    if (files.some(f => f.includes('flask'))) return '后端服务-Flask';
    return '后端服务-Python';
  }
  
  // Check for Java projects
  if (files.includes('pom.xml')) return '后端服务-Maven';
  if (files.includes('build.gradle') || files.includes('build.gradle.kts')) return '后端服务-Gradle';
  
  // Check for Go projects
  if (files.includes('go.mod')) return '后端服务-Go';
  
  // Check for Rust projects
  if (files.includes('Cargo.toml')) return '后端服务-Rust';
  
  // Check for Flutter/Dart
  if (files.includes('pubspec.yaml')) return '移动应用-Flutter';
  
  // Check for iOS
  if (files.some(f => f.endsWith('.xcodeproj') || f.endsWith('.xcworkspace'))) return '移动应用-iOS';
  
  // Check for Android
  if (files.includes('build.gradle') && files.includes('AndroidManifest.xml')) return '移动应用-Android';
  
  // Check for Docker
  if (files.includes('Dockerfile') || files.includes('docker-compose.yml')) return '容器化项目';
  
  // Default
  return '其他项目';
}

function extractMiddleware(projectPath) {
  const middleware = [];
  
  try {
    // Check package.json for Node.js middleware
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['redis']) middleware.push({ middleware_name: 'Redis', middleware_config: '' });
      if (deps['mysql'] || deps['mysql2']) middleware.push({ middleware_name: 'MySQL', middleware_config: '' });
      if (deps['pg']) middleware.push({ middleware_name: 'PostgreSQL', middleware_config: '' });
      if (deps['mongodb'] || deps['mongoose']) middleware.push({ middleware_name: 'MongoDB', middleware_config: '' });
      if (deps['kafka-node'] || deps['kafkajs']) middleware.push({ middleware_name: 'Kafka', middleware_config: '' });
      if (deps['amqplib']) middleware.push({ middleware_name: 'RabbitMQ', middleware_config: '' });
      if (deps['elasticsearch']) middleware.push({ middleware_name: 'Elasticsearch', middleware_config: '' });
    }
    
    // Check requirements.txt for Python middleware
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf-8');
      if (requirements.includes('redis')) middleware.push({ middleware_name: 'Redis', middleware_config: '' });
      if (requirements.includes('mysql') || requirements.includes('pymysql')) middleware.push({ middleware_name: 'MySQL', middleware_config: '' });
      if (requirements.includes('psycopg2')) middleware.push({ middleware_name: 'PostgreSQL', middleware_config: '' });
      if (requirements.includes('pymongo')) middleware.push({ middleware_name: 'MongoDB', middleware_config: '' });
      if (requirements.includes('kafka')) middleware.push({ middleware_name: 'Kafka', middleware_config: '' });
      if (requirements.includes('celery')) middleware.push({ middleware_name: 'Celery', middleware_config: '' });
    }
    
    // Check pom.xml for Java middleware
    const pomPath = path.join(projectPath, 'pom.xml');
    if (fs.existsSync(pomPath)) {
      const pom = fs.readFileSync(pomPath, 'utf-8');
      if (pom.includes('spring-boot-starter-data-redis')) middleware.push({ middleware_name: 'Redis', middleware_config: '' });
      if (pom.includes('mysql-connector')) middleware.push({ middleware_name: 'MySQL', middleware_config: '' });
      if (pom.includes('postgresql')) middleware.push({ middleware_name: 'PostgreSQL', middleware_config: '' });
      if (pom.includes('mongodb')) middleware.push({ middleware_name: 'MongoDB', middleware_config: '' });
      if (pom.includes('kafka')) middleware.push({ middleware_name: 'Kafka', middleware_config: '' });
    }
    
    // Check go.mod for Go middleware
    const goModPath = path.join(projectPath, 'go.mod');
    if (fs.existsSync(goModPath)) {
      const goMod = fs.readFileSync(goModPath, 'utf-8');
      if (goMod.includes('redis')) middleware.push({ middleware_name: 'Redis', middleware_config: '' });
      if (goMod.includes('mysql')) middleware.push({ middleware_name: 'MySQL', middleware_config: '' });
      if (goMod.includes('postgres')) middleware.push({ middleware_name: 'PostgreSQL', middleware_config: '' });
      if (goMod.includes('mongo')) middleware.push({ middleware_name: 'MongoDB', middleware_config: '' });
      if (goMod.includes('kafka')) middleware.push({ middleware_name: 'Kafka', middleware_config: '' });
    }
  } catch (error) {
    console.error(`Error extracting middleware for ${projectPath}:`, error.message);
  }
  
  return middleware;
}

function extractResources(projectPath) {
  const resources = [];
  
  try {
    // Check for docker-compose.yml
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      resources.push({ resource_name: 'Docker Compose', resource_description: '容器编排配置' });
    }
    
    // Check for Dockerfile
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    if (fs.existsSync(dockerfilePath)) {
      resources.push({ resource_name: 'Dockerfile', resource_description: '容器镜像构建文件' });
    }
    
    // Check for CI/CD configs
    if (fs.existsSync(path.join(projectPath, '.github/workflows'))) {
      resources.push({ resource_name: 'GitHub Actions', resource_description: 'CI/CD自动化流程' });
    }
    
    if (fs.existsSync(path.join(projectPath, '.gitlab-ci.yml'))) {
      resources.push({ resource_name: 'GitLab CI', resource_description: 'CI/CD自动化流程' });
    }
    
    // Check for README
    const readmeFiles = ['README.md', 'README.MD', 'readme.md', 'Readme.md'];
    if (readmeFiles.some(f => fs.existsSync(path.join(projectPath, f)))) {
      resources.push({ resource_name: 'README文档', resource_description: '项目说明文档' });
    }
    
    // Check for API documentation
    if (fs.existsSync(path.join(projectPath, 'swagger.json')) || 
        fs.existsSync(path.join(projectPath, 'openapi.json'))) {
      resources.push({ resource_name: 'API文档', resource_description: 'Swagger/OpenAPI接口文档' });
    }
  } catch (error) {
    console.error(`Error extracting resources for ${projectPath}:`, error.message);
  }
  
  return resources;
}

function generateDescription(projectName, projectType, middleware, resources) {
  const parts = [];
  
  parts.push(`${projectName}是一个${projectType}项目`);
  
  if (middleware.length > 0) {
    const middlewareNames = middleware.map(m => m.middleware_name).join('、');
    parts.push(`使用了${middlewareNames}等中间件`);
  }
  
  if (resources.length > 0) {
    const hasDocker = resources.some(r => r.resource_name.includes('Docker'));
    const hasCI = resources.some(r => r.resource_name.includes('CI') || r.resource_name.includes('Actions'));
    
    if (hasDocker) parts.push('支持容器化部署');
    if (hasCI) parts.push('配置了自动化CI/CD流程');
  }
  
  return parts.join('，') + '。';
}

async function scanProjects() {
  const projects = [];
  const entries = fs.readdirSync(WORKSPACE_PATH);
  
  for (const entry of entries) {
    const projectPath = path.join(WORKSPACE_PATH, entry);
    
    // Skip files and hidden directories
    if (!fs.statSync(projectPath).isDirectory() || entry.startsWith('.')) {
      continue;
    }
    
    console.log(`\n扫描项目: ${entry}`);
    
    try {
      const projectType = detectProjectType(projectPath, entry);
      const gitUrl = isGitRepository(projectPath) ? getGitRemoteUrl(projectPath) : null;
      const middleware = extractMiddleware(projectPath);
      const resources = extractResources(projectPath);
      const description = generateDescription(entry, projectType, middleware, resources);
      
      const project = {
        name: entry,
        project_type: projectType,
        description: description,
        project_url: gitUrl,
        dev_device_name: 'MAC电脑',
        dev_device_path: projectPath,
        middleware: middleware,
        resources: resources
      };
      
      projects.push(project);
      
      console.log(`  类型: ${projectType}`);
      console.log(`  Git URL: ${gitUrl || '无'}`);
      console.log(`  中间件: ${middleware.length}个`);
      console.log(`  资源: ${resources.length}个`);
      console.log(`  描述: ${description}`);
      
    } catch (error) {
      console.error(`  错误: ${error.message}`);
    }
  }
  
  return projects;
}

async function importProject(project) {
  try {
    // Create basic project
    const basicData = {
      name: project.name,
      project_type: project.project_type,
      description: project.description,
      project_url: project.project_url,
      dev_device_name: project.dev_device_name,
      dev_device_path: project.dev_device_path,
      service_urls: []
    };
    
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basicData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }
    
    const createdProject = await response.json();
    console.log(`✓ 创建项目: ${project.name} (ID: ${createdProject.id})`);
    
    // Add middleware and resources via extended endpoint
    if (project.middleware.length > 0 || project.resources.length > 0) {
      const extendedData = {
        middleware: project.middleware,
        resources: project.resources
      };
      
      const extendedResponse = await fetch(`${API_BASE_URL}/projects/${createdProject.id}/extended`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extendedData)
      });
      
      if (extendedResponse.ok) {
        console.log(`  ✓ 添加了 ${project.middleware.length} 个中间件和 ${project.resources.length} 个资源`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`✗ 导入失败 ${project.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('开始扫描工作区项目...\n');
  console.log(`工作区路径: ${WORKSPACE_PATH}\n`);
  
  const projects = await scanProjects();
  
  console.log(`\n\n找到 ${projects.length} 个项目\n`);
  console.log('开始导入到数据库...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const project of projects) {
    const success = await importProject(project);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n\n导入完成!`);
  console.log(`成功: ${successCount} 个项目`);
  console.log(`失败: ${failCount} 个项目`);
}

main().catch(console.error);
