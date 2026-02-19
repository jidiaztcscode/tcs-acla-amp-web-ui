import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragAndDrop } from './drag-and-drop';

describe('DragAndDrop', () => {
  let component: DragAndDrop;
  let fixture: ComponentFixture<DragAndDrop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragAndDrop]
    }).compileComponents();

    fixture = TestBed.createComponent(DragAndDrop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should move item within the same list using moveItemInArray', () => {
    const container = {
      data: ['Uno', 'Dos']
    } as any;

    const event = {
      previousIndex: 0,
      currentIndex: 1,
      container,
      previousContainer: container,
      item: null,
      isPointerOverContainer: false,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
      event: {}
    } as any;

    component.drop(event);
    expect(container.data).toEqual(['Dos', 'Uno']);
  });

  it('should transfer item between lists using transferArrayItem', () => {
    const source = {
      data: ['Uno', 'Dos']
    } as any;

    const target = {
      data: []
    } as any;

    const event = {
      previousIndex: 0,
      currentIndex: 0,
      container: target,
      previousContainer: source,
      item: null,
      isPointerOverContainer: false,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
      event: {}
    } as any;

    component.drop(event);

    expect(source.data).toEqual(['Dos']);
    expect(target.data).toEqual(['Uno']);
  });
});
