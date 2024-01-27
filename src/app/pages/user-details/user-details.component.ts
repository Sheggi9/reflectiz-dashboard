import {Component, Inject, LOCALE_ID, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import {AsyncPipe, DatePipe, JsonPipe, NgIf, NgTemplateOutlet, TitleCasePipe} from "@angular/common";
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  AbstractControl
} from '@angular/forms';
import {distinctUntilChanged, map, Observable, of, startWith, Subject, takeUntil} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {
  MatCardModule
} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteSelectedEvent, MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgxColorsModule} from "ngx-colors";
import {UserService} from "@services";

const COLOR_FORMAT_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$|^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*\d*\.?\d+\s*)?\)$|^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*\d*\.?\d+\s*)?\)$/;

@Component({
  selector: 'app-user-details',
  standalone: true,
  providers: [
    provideNativeDateAdapter()
  ],
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    DatePipe,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    AsyncPipe,
    NgxColorsModule,
    JsonPipe,
    NgTemplateOutlet,
    TitleCasePipe,


  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnDestroy {
  @ViewChild('customSnackbarTemplate') customSnackbarTemplate!: TemplateRef<any>;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  private _destroy$ = new Subject();
  sendingUserData = false;
  maxDate: Date;
  addOnBlur = false;
  allHobbyList: string[] = ['guitar', 'sport', 'paint'];
  hobbyList: string[] = ['guitar'];
  filteredHobby: Observable<string[]>;
  hobbyInputCtrl = new FormControl('');
  userForm: FormGroup;

  constructor(@Inject(LOCALE_ID) private locale: string, fb: FormBuilder, private snackBar: MatSnackBar, private userService: UserService) {
    const currentDate = new Date();
    this.maxDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());


    this.userForm = fb.group({
      birthday: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      amountSeats: new FormControl(null, [Validators.required]),
      engine: new FormControl('', [Validators.required]),
      color: new FormControl('', [Validators.required, Validators.pattern(COLOR_FORMAT_REGEX)]),
      hobby: new FormControl(['guitar'], [Validators.required])
    });

    console.log(this.userForm);

    (this.userForm.get('birthday') as AbstractControl).valueChanges.pipe(
      takeUntil(this._destroy$),
      distinctUntilChanged()
    ).subscribe((v) => {
      this.setBirthday(v);
    });

    this.filteredHobby = this.hobbyInputCtrl.valueChanges.pipe(
      takeUntil(this._destroy$),
      startWith(null),
      map((hobby: string | null) => (hobby ? this.filterHobby(hobby) : this.filterHobby(null))),
    );
  }

  saveUser() {
    this.sendingUserData = true;
    this.userService.saveUser(this.userForm.value).pipe(
      takeUntil(this._destroy$)
    ).subscribe(_ => {
      const ref = this.snackBar.openFromTemplate(this.customSnackbarTemplate, {
        duration: 1000,
      });
      ref.afterDismissed().pipe(
        takeUntil(this._destroy$)
      ).subscribe(() => {
        this.sendingUserData = false;
      });
    })
  }

  getControlByName(name: string) {
    return (this.userForm.get(name) as AbstractControl);
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  setBirthday(v: string | null): void {
    if (v) {
      const formattedDate = new DatePipe(this.locale).transform(v, 'yyyy-MM-dd', );
      (this.userForm.get('birthday') as AbstractControl).setValue(formattedDate);
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.hobbyList.push(value);
      this.userForm.get('hobby')?.patchValue(this.hobbyList)
    }
    event.chipInput!.clear();
    this.hobbyInputCtrl.setValue(null);
  }

  remove(hobby: string): void {
    const index = this.hobbyList.indexOf(hobby);
    if (index >= 0) {
      this.hobbyList.splice(index, 1);
      this.userForm.get('hobby')?.patchValue(this.hobbyList)
      this.filteredHobby = of(this.filterHobby(null))
    }
  }

  edit(hobby: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.remove(hobby);
      return;
    }
    const index = this.hobbyList.indexOf(hobby);
    if (index >= 0) {
      this.hobbyList[index] = value;
    }
  }

  selected(event: MatAutocompleteSelectedEvent, hobbyInput: HTMLInputElement): void {
    this.hobbyList.push(event.option.viewValue);
    this.userForm.get('hobby')?.patchValue(this.hobbyList)
    hobbyInput.value = '';
    this.hobbyInputCtrl.setValue(null);
    this.filteredHobby = of(this.filterHobby(null))
  }

  private filterHobby(value: string | null): string[] {
    const filterBy = this.hobbyList.map(el => el.toLowerCase());
    const filteredSelected = [...this.allHobbyList].filter(hobby => !filterBy.includes(hobby.toLowerCase()))
    if (value) {
      const filterValue = value.toLowerCase();
      return filteredSelected.filter(hobby => hobby.toLowerCase().includes(filterValue));
    } else {
      return filteredSelected;
    }
  }

  updateColor(newColor: any): void {
    (this.userForm.get('color') as AbstractControl).setValue(newColor.value);
  }
}

