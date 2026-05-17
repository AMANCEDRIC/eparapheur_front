import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.sass',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() error: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() icon: string = '';

  value: string = '';
  showPassword = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get currentType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  getInputClasses(): string {
    const baseClasses = 'w-full rounded border outline-none h-9 text-xs font-bold transition-all';
    
    // Default vs Error borders
    const borderClass = this.error 
      ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-slate-900' 
      : 'border-slate-200 group-hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900';
      
    // Default vs Disabled backgrounds
    const bgClass = this.disabled 
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
      : 'bg-slate-50/50 focus:bg-white';
      
    // Padding
    const paddingLeftClass = 'px-3';
    const paddingRightClass = (this.type === 'password' || this.icon) ? 'pr-9' : '';
    
    return `${baseClasses} ${borderClass} ${bgClass} ${paddingLeftClass} ${paddingRightClass}`.trim();
  }
}
