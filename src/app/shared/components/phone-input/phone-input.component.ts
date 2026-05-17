import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() error: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;

  private iti: any;
  value: string = '';

  onChange = (value: string) => { };
  onTouched = () => { };

  ngAfterViewInit(): void {
    if (this.phoneInput) {
      this.iti = intlTelInput(this.phoneInput.nativeElement, {
        initialCountry: "ci",
        separateDialCode: true,
        loadUtils: () => import('intl-tel-input/utils'),
      });

      this.phoneInput.nativeElement.addEventListener('countrychange', this.handleInput.bind(this));
      this.phoneInput.nativeElement.addEventListener('input', this.handleInput.bind(this));

      // Set initial value if it exists before init
      if (this.value) {
        this.iti.setNumber(this.value);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.iti) {
      this.phoneInput.nativeElement.removeEventListener('countrychange', this.handleInput.bind(this));
      this.phoneInput.nativeElement.removeEventListener('input', this.handleInput.bind(this));
      this.iti.destroy();
    }
  }

  handleInput(): void {
    if (this.iti && this.iti.isValidNumber()) {
      this.value = this.iti.getNumber();
    } else {
      this.value = this.phoneInput.nativeElement.value;
    }
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.iti) {
      this.iti.setNumber(this.value);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.phoneInput) {
      this.phoneInput.nativeElement.disabled = isDisabled;
    }
  }

  getInputClasses(): string {
    const baseClasses = 'w-full rounded border outline-none h-9 text-xs font-bold transition-all';

    // Default vs Error borders
    const borderClass = this.error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-slate-900'
      : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900';

    // Default vs Disabled backgrounds
    const bgClass = this.disabled
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
      : 'bg-slate-50/50 focus:bg-white hover:border-slate-300';

    // Let intl-tel-input handle the left padding for the flag dropdown, we just need standard right padding
    const paddingClass = 'pr-3';

    return `${baseClasses} ${borderClass} ${bgClass} ${paddingClass}`.trim();
  }
}
