import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfochatPage } from './infochat.page';

describe('InfochatPage', () => {
  let component: InfochatPage;
  let fixture: ComponentFixture<InfochatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfochatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
