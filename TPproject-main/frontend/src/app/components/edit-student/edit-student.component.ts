import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from '../../shared/api.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

export interface Subject {
  name: string;
}

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css']
})

export class EditStudentComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  @ViewChild('chipList', { static: true }) chipList;
  @ViewChild('resetStudentForm', { static: true }) myNgForm;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  studentForm: FormGroup;
  subjectArray: Subject[] = [];
  SectioinArray: string[] = ['Sala 1', 'Sala 2', 'Sala 3']; // Atualizado para incluir as opções de Sala

  ngOnInit() {
    this.updateBookForm();
  }

  constructor(
    public fb: FormBuilder,
    private router: Router,
    private ngZone: NgZone,
    private actRoute: ActivatedRoute,
    private studentApi: ApiService
  ) { 
    var id = this.actRoute.snapshot.paramMap.get('id');
    this.studentApi.GetStudent(id).subscribe(data => {
      console.log(data.subjects)
      this.subjectArray = data.subjects;
      this.studentForm = this.fb.group({
        student_name: [data.student_name, [Validators.required]],
        student_email: [data.student_email, [Validators.required]],
        section: [data.section, [Validators.required]],
        subjects: [data.subjects],
        dob: [data.dob, [Validators.required]],
        gender: [data.gender]
      })      
    })    
  }

  /* Reactive book form */
  updateBookForm() {
    this.studentForm = this.fb.group({
      student_name: ['', [Validators.required]],
      student_email: ['', [Validators.required]],
      section: ['', [Validators.required]],
      subjects: [this.subjectArray],
      dob: ['', [Validators.required]],
      gender: ['Male']
    })
  }

  /* Add dynamic languages */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add language
    if ((value || '').trim() && this.subjectArray.length < 5) {
      this.subjectArray.push({ name: value.trim() })
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  /* Remove dynamic languages */
  remove(subject: Subject): void {
    const index = this.subjectArray.indexOf(subject);
    if (index >= 0) {
      this.subjectArray.splice(index, 1);
    }
  }

  /* Date */
  formatDate(e) {
    var convertDate = new Date(e.target.value).toISOString().substring(0, 10);
    this.studentForm.get('dob').setValue(convertDate, {
      onlyself: true
    })
  }

  /* Get errors */
  public handleError = (controlName: string, errorName: string) => {
    return this.studentForm.controls[controlName].hasError(errorName);
  }

  /* Update book */
  updateStudentForm() {
    console.log(this.studentForm.value)
    var id = this.actRoute.snapshot.paramMap.get('id');
    if (window.confirm('Confirmar alterações?')) {
      this.studentApi.UpdateStudent(id, this.studentForm.value).subscribe( res => {
        this.ngZone.run(() => this.router.navigateByUrl('/students-list'))
      });
    }
  }
  
}
