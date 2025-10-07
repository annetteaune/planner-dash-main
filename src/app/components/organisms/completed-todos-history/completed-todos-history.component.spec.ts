import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompletedTodosHistoryComponent } from './completed-todos-history.component';

describe('CompletedTodosHistoryComponent', () => {
  let component: CompletedTodosHistoryComponent;
  let fixture: ComponentFixture<CompletedTodosHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedTodosHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedTodosHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
