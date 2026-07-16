import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatopenPage } from './chatopen.page';

describe('ChatopenPage', () => {
  let component: ChatopenPage;
  let fixture: ComponentFixture<ChatopenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatopenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
