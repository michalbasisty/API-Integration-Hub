# PulseAPI - Best Practices & Code Standards

This document defines coding standards, best practices, and architectural decisions for the entire PulseAPI project across all services.

## 📋 Table of Contents

1. [Frontend (Angular 20)](#frontend-angular-20)
2. [Backend (Symfony + PHP)](#backend-symfony--php)
3. [AI Service (Go)](#ai-service-go)
4. [Mobile (React Native)](#mobile-react-native)
5. [General Practices](#general-practices)

---

## Frontend (Angular 20)

### TypeScript Best Practices

```typescript
// ✅ DO: Use strict type checking
interface Monitor {
  id: number;
  name: string;
  url: string;
  status: 'active' | 'paused';
}

// ✅ DO: Prefer type inference
const result = fetchMonitor(id); // Type inferred from return type

// ❌ DON'T: Avoid `any` type
const data: any = response; // BAD

// ✅ DO: Use `unknown` when type is uncertain
let data: unknown = JSON.parse(jsonString);
if (typeof data === 'object' && data !== null) {
  // Use data
}
```

### Angular Components

```typescript
// ✅ DO: Use standalone components (Angular 20 default)
@Component({
  selector: 'app-monitor-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `...`,
  styles: [`...`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorListComponent {
  // ✅ DO: Use signals for state
  monitors = signal<Monitor[]>([]);
  
  // ✅ DO: Use computed() for derived state
  activeCount = computed(() => 
    this.monitors().filter(m => m.status === 'active').length
  );
  
  constructor(private service: MonitorService) {}
}

// ❌ DON'T: Don't use NgModules (deprecated in v20)
@NgModule({...}) // AVOID
```

### Component Input/Output

```typescript
// ✅ DO: Use input() and output() functions
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-monitor-card',
  template: `...`,
  standalone: true,
})
export class MonitorCardComponent {
  // ✅ DO: Use input() function
  monitor = input.required<Monitor>();
  isLoading = input<boolean>(false);
  
  // ✅ DO: Use output() function
  statusChanged = output<{ id: number; status: string }>();
  
  onStatusChange(newStatus: string) {
    this.statusChanged.emit({ id: this.monitor().id, status: newStatus });
  }
}

// ❌ DON'T: Avoid @Input/@Output decorators
@Input() monitor!: Monitor; // AVOID in new code
@Output() statusChanged = new EventEmitter(); // AVOID
```

### State Management

```typescript
// ✅ DO: Use signals
private monitorData = signal<Monitor[]>([]);

// ✅ DO: Use computed() for derived state
filteredMonitors = computed(() => {
  return this.monitorData().filter(m => m.status === 'active');
});

// ✅ DO: Use set() or update() on signals
this.monitorData.set([...newMonitors]);
this.monitorData.update(monitors => [...monitors, newMonitor]);

// ❌ DON'T: Avoid mutate()
this.monitorData.mutate(monitors => monitors.push(newMonitor)); // AVOID
```

### Templates

```html
<!-- ✅ DO: Use native control flow -->
@if (isLoading()) {
  <app-spinner />
} @else {
  <app-monitor-list />
}

@for (monitor of monitors(); track monitor.id) {
  <app-monitor-card [monitor]="monitor" />
}

@switch (status()) {
  @case ('active') {
    <span>Active</span>
  }
  @case ('paused') {
    <span>Paused</span>
  }
}

<!-- ❌ DON'T: Avoid structural directives -->
<div *ngIf="isLoading"></div> <!-- AVOID -->
<div *ngFor="let monitor of monitors"></div> <!-- AVOID -->

<!-- ✅ DO: Use class bindings -->
<div [class]="{ active: isActive(), error: hasError() }">
<div [class.highlight]="isSelected()">

<!-- ❌ DON'T: Avoid ngClass/ngStyle -->
<div [ngClass]="{ 'class-name': condition }"></div> <!-- AVOID -->
<div [ngStyle]="{ color: dynamicColor }"></div> <!-- AVOID -->

<!-- ✅ DO: Use style bindings -->
<div [style.color]="dynamicColor()">

<!-- ✅ DO: Use async pipe for observables -->
<div>{{ (monitors$ | async)?.length }}</div>

<!-- ❌ DON'T: Avoid arrow functions -->
<button (click)="() => deleteMonitor(id)"></button> <!-- AVOID -->

<!-- ✅ DO: Use handler methods -->
<button (click)="deleteMonitor(id)"></button>
```

### Services

```typescript
// ✅ DO: Design services with single responsibility
@Injectable({ providedIn: 'root' })
export class MonitorService {
  // ✅ DO: Use inject() function
  private http = inject(HttpClient);
  private apiUrl = '/api/monitors';
  
  getMonitors(): Observable<Monitor[]> {
    return this.http.get<Monitor[]>(this.apiUrl);
  }
  
  getMonitor(id: number): Observable<Monitor> {
    return this.http.get<Monitor>(`${this.apiUrl}/${id}`);
  }
}

// ✅ DO: Keep related state in one service
@Injectable({ providedIn: 'root' })
export class MonitorStateService {
  private store = inject(Store);
  
  monitors$ = this.store.select(selectMonitors);
  loading$ = this.store.select(selectLoading);
}

// ❌ DON'T: Avoid constructor injection
constructor(private http: HttpClient) {} // AVOID in new code

// ✅ DO: Use providedIn: 'root' for singletons
@Injectable({ providedIn: 'root' }) // GOOD
export class MonitorService { }
```

### Change Detection

```typescript
// ✅ DO: Always use OnPush strategy
@Component({
  selector: 'app-monitor',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorComponent {}

// ✅ DO: Let signals drive change detection
// With OnPush, component only updates when signals change
```

### Accessibility

```typescript
// ✅ DO: Use semantic HTML
<button aria-label="Delete monitor">×</button>
<nav aria-label="Main navigation">
<main role="main">

// ✅ DO: Ensure color contrast (WCAG AA minimum)
// Use tools like WebAIM Contrast Checker

// ✅ DO: Manage focus
setFocus(elementRef: ElementRef) {
  this.cdr.detectChanges();
  elementRef.nativeElement.focus();
}

// ✅ DO: Use ARIA attributes appropriately
<div role="status" aria-live="polite" aria-label="Monitor status">

// Run AXE checks in testing
```

### File Structure

```
web/src/
├── app/
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   └── dashboard.component.scss
│   │   ├── monitors/
│   │   ├── alerts/
│   │   └── settings/
│   ├── components/
│   │   ├── monitor-card/
│   │   ├── status-badge/
│   │   └── metric-chart/
│   ├── services/
│   │   ├── monitor.service.ts
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   ├── models/
│   │   ├── monitor.ts
│   │   ├── metric.ts
│   │   └── alert.ts
│   ├── app.routes.ts
│   └── app.component.ts
└── main.ts
```

---

## Backend (Symfony + PHP)

### Code Style

```php
<?php
// ✅ DO: Use strict types
declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// ✅ DO: Type hint parameters and returns
class MonitorController extends AbstractController
{
    public function list(MonitorService $service): Response
    {
        $monitors = $service->getMonitors();
        return $this->json($monitors);
    }
    
    public function get(int $id, MonitorService $service): Response
    {
        $monitor = $service->getMonitor($id);
        return $this->json($monitor);
    }
}

// ❌ DON'T: Avoid untyped parameters
public function list($service) {} // AVOID
```

### Services

```php
<?php
// ✅ DO: Single responsibility
#[AsService]
readonly class MonitorService
{
    public function __construct(
        private MonitorRepository $repository,
        private HealthCheckerService $checker,
    ) {}
    
    public function getMonitors(): array
    {
        return $this->repository->findAll();
    }
    
    public function checkMonitor(int $id): Metric
    {
        $monitor = $this->repository->find($id);
        return $this->checker->check($monitor);
    }
}

// ❌ DON'T: Mix responsibilities
class MonitorService
{
    public function getMonitors() {}
    public function sendEmails() {} // Avoid - should be AlertService
    public function generateReports() {} // Avoid - should be ReportService
}
```

### Database

```php
<?php
// ✅ DO: Use Doctrine entities
#[ORM\Entity(repositoryClass: MonitorRepository::class)]
#[ORM\Table(name: 'monitors')]
class Monitor
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $id;
    
    #[ORM\Column(type: 'string', length: 255)]
    private string $name;
    
    #[ORM\Column(type: 'string', length: 255)]
    private string $url;
    
    #[ORM\Column(type: 'integer')]
    private int $checkInterval = 60;
}

// ✅ DO: Use repositories for queries
class MonitorRepository extends ServiceEntityRepository
{
    public function findActive(): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.isActive = true')
            ->getQuery()
            ->getResult();
    }
}

// ❌ DON'T: Write raw SQL queries
// $em->createQuery("SELECT * FROM monitors WHERE id = ?") // AVOID
```

### File Structure

```
backend/
├── src/
│   ├── Controller/
│   │   ├── MonitorController.php
│   │   ├── MetricController.php
│   │   └── AlertController.php
│   ├── Service/
│   │   ├── MonitorService.php
│   │   ├── HealthCheckerService.php
│   │   └── AlertService.php
│   ├── Repository/
│   │   ├── MonitorRepository.php
│   │   ├── MetricRepository.php
│   │   └── AlertRepository.php
│   ├── Entity/
│   │   ├── Monitor.php
│   │   ├── Metric.php
│   │   ├── Alert.php
│   │   └── User.php
│   ├── Event/
│   │   └── AlertTriggeredEvent.php
│   ├── EventListener/
│   │   └── AlertListener.php
│   └── Command/
│       └── CheckMonitorsCommand.php
├── config/
├── public/
└── tests/
```

---

## AI Service (Go)

### Code Style

```go
// ✅ DO: Follow Go conventions
package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
)

// ✅ DO: Use clear, concise names
type HealthResponse struct {
    Status    string    `json:"status"`
    Service   string    `json:"service"`
    Timestamp time.Time `json:"timestamp"`
}

// ✅ DO: Handle errors explicitly
func checkHealth(ctx context.Context) error {
    resp, err := http.Get("http://backend:8000/api/health")
    if err != nil {
        return fmt.Errorf("health check failed: %w", err)
    }
    defer resp.Body.Close()
    return nil
}

// ❌ DON'T: Ignore errors
_ = http.Get(url) // AVOID

// ✅ DO: Use interfaces
type HealthChecker interface {
    Check(ctx context.Context) (*HealthResponse, error)
}

// ✅ DO: Make code testable
func NewHealthService(client HTTPClient) *HealthService {
    return &HealthService{client: client}
}
```

### Concurrency

```go
// ✅ DO: Use goroutines for parallel work
func analyzeMetrics(metrics []Metric) []Anomaly {
    results := make(chan Anomaly, len(metrics))
    
    for _, m := range metrics {
        go func(metric Metric) {
            anomaly := detectAnomaly(metric)
            results <- anomaly
        }(m)
    }
    
    var anomalies []Anomaly
    for i := 0; i < len(metrics); i++ {
        anomalies = append(anomalies, <-results)
    }
    return anomalies
}

// ✅ DO: Use context for cancellation
func processWithTimeout(ctx context.Context, data []Metric) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    
    // Process with context
}

// ❌ DON'T: Ignore goroutine leaks
go func() {
    for {
        doWork() // Never exits
    }
}() // AVOID
```

### File Structure

```
ai-service/
├── main.go
├── handlers/
│   ├── health.go
│   ├── status.go
│   └── analyze.go
├── services/
│   ├── health_checker.go
│   ├── metric_analyzer.go
│   └── anomaly_detector.go
├── models/
│   ├── health.go
│   ├── metric.go
│   └── anomaly.go
├── utils/
│   ├── logger.go
│   └── statistics.go
├── go.mod
└── go.sum
```

---

## Mobile (React Native)

### TypeScript

```typescript
// ✅ DO: Use strict types
interface Monitor {
  id: string;
  name: string;
  status: 'up' | 'down';
  lastCheck: Date;
}

// ✅ DO: Type component props
interface MonitorCardProps {
  monitor: Monitor;
  onPress: (id: string) => void;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({
  monitor,
  onPress,
}) => {
  // Implementation
};

// ❌ DON'T: Use implicit any
const data = response.data; // AVOID - use typed response
```

### Components

```typescript
// ✅ DO: Use functional components
const DashboardScreen: React.FC = () => {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchMonitors();
  }, []);
  
  const fetchMonitors = async () => {
    setLoading(true);
    try {
      const response = await api.getMonitors();
      setMonitors(response.data);
    } catch (error) {
      console.error('Failed to fetch monitors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={monitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MonitorCard monitor={item} />}
        />
      )}
    </SafeAreaView>
  );
};

// ✅ DO: Keep components focused
// Each component should have one responsibility

// ❌ DON'T: Create huge components
// Split into smaller, reusable components
```

### File Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── MonitorsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── MonitorCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── MetricChart.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── types/
│   │   ├── monitor.ts
│   │   └── metric.ts
│   ├── App.tsx
│   └── index.ts
├── android/
├── ios/
└── package.json
```

---

## General Practices

### Error Handling

```typescript
// ✅ DO: Handle errors gracefully
try {
  const result = await api.getMonitors();
  return result;
} catch (error) {
  logger.error('Failed to fetch monitors:', error);
  throw new AppError('Unable to load monitors', 'FETCH_FAILED');
}

// ✅ DO: Log errors with context
logger.error('Monitor check failed', {
  monitorId: monitor.id,
  url: monitor.url,
  error: error.message,
  timestamp: new Date(),
});

// ❌ DON'T: Silently ignore errors
try {
  fetchData();
} catch (error) {
  // Nothing
} // AVOID
```

### Testing

```typescript
// ✅ DO: Write unit tests
describe('MonitorService', () => {
  it('should fetch monitors', async () => {
    const service = new MonitorService(mockRepository);
    const monitors = await service.getMonitors();
    expect(monitors).toHaveLength(3);
  });
});

// ✅ DO: Write integration tests
describe('Monitor API', () => {
  it('POST /api/monitors should create monitor', async () => {
    const response = await request(app)
      .post('/api/monitors')
      .send({ name: 'Test API', url: 'http://test.com' })
      .expect(201);
  });
});

// ✅ DO: Mock external dependencies
const mockHttpClient = {
  get: jest.fn().mockResolvedValue({ data: [] }),
};
```

### Documentation

```typescript
/**
 * ✅ DO: Document public APIs
 * Fetches all monitors for the current user.
 * 
 * @param userId - The ID of the user
 * @param options - Optional filtering and pagination
 * @returns Promise resolving to array of monitors
 * @throws {NotFoundError} If user doesn't exist
 * 
 * @example
 * const monitors = await monitorService.getUserMonitors('user-123');
 */
async getUserMonitors(userId: string, options?: QueryOptions): Promise<Monitor[]> {
  // Implementation
}

// ✅ DO: Comment complex logic
// Calculate uptime percentage using weighted average
// Recent checks have higher weight
const uptime = metrics
  .sort((a, b) => b.timestamp - a.timestamp)
  .reduce((sum, metric, index) => {
    const weight = 1 / (index + 1); // Decay older checks
    return sum + (metric.success ? weight : 0);
  }, 0) / totalWeight;
```

### Git Practices

```bash
# ✅ DO: Write clear commit messages
git commit -m "feat: add monitor health check endpoint"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API documentation"

# ✅ DO: Use conventional commits
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code reorganization
# test: add tests
# chore: maintenance

# ❌ DON'T: Use vague messages
git commit -m "update stuff" # AVOID
```

### Naming Conventions

```typescript
// ✅ DO: Use clear, descriptive names

// Classes/Types - PascalCase
class MonitorService { }
interface HealthResponse { }

// Functions/Methods - camelCase
function checkMonitorHealth() { }
const getActiveMonitors = () => { }

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// Private members - _camelCase or #camelCase
private _internalState: State;
#private: PrivateField;

// Avoid ambiguous names
// ❌ DON'T
const data = fetch(); // Too vague
const result = process(input); // What does it do?

// ✅ DO
const monitors = fetchMonitors();
const successCount = countSuccessfulChecks(metrics);
```

### Performance

```typescript
// ✅ DO: Optimize queries
// Use pagination
const monitors = await repository
  .createQueryBuilder('m')
  .limit(20)
  .offset(0)
  .getMany();

// Use indexes on frequently searched columns
#[ORM\Index(columns: ['user_id', 'created_at'])]

// ✅ DO: Cache frequently accessed data
const cachedMonitors = await redis.get('monitors');
if (!cachedMonitors) {
  const monitors = await fetchFromDatabase();
  await redis.set('monitors', monitors, { ttl: 300 });
}

// ✅ DO: Use appropriate data structures
// Array for ordered items
// Set for unique values
// Map for key-value lookups

// ❌ DON'T: N+1 queries
monitors.forEach(monitor => {
  const metrics = fetchMetrics(monitor.id); // Called for each monitor!
});
```

---

## Next Steps

These best practices should be followed when implementing:

1. **Stage 2** - Core Monitoring
   - Follow entity patterns from Backend section
   - Implement services following Service guidelines
   - Use Angular component structure from Frontend section

2. **Stage 3** - Dashboard Analytics
   - Follow Angular component best practices
   - Implement signals and computed properties
   - Use OnPush change detection

3. **Stage 4** - AI Service
   - Follow Go concurrency patterns
   - Implement proper error handling
   - Use interfaces for testability

For code review checklist, see [CODE_REVIEW.md](CODE_REVIEW.md)
