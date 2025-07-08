import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  CalendarEvent,
  CalendarModule,
  CalendarView,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
} from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { EventColor } from 'calendar-utils';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogService } from 'primeng/dynamicdialog';
import { FormEventoComponent } from './form-evento/form-evento.component';
import { FeriadoService } from '@services/feriado.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom/button-custom.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { MessageGlobalService } from '@services/message-global.service';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-calendario',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SelectModule,
    TagModule,
    DatePickerModule,
    TooltipModule,
    PopoverModule,
    MultiSelectModule,
    ButtonModule,
    CalendarModule,
    SelectButtonModule,
    TableModule,
    SkeletonModule,
    TitleCardComponent,
    ButtonCustomComponent,
    // ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './calendario.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarioComponent implements OnInit {
  title: string = 'Calendario';

  icon: string = 'material-symbols:calendar-month-outline-rounded';

  private readonly msg = inject(MessageGlobalService);

  private readonly dialogService = inject(DialogService);

  private readonly feriadoService = inject(FeriadoService);

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  viewOptions: any[] = [
    {
      value: 'grid',
      icon: 'material-symbols:grid-view-outline-rounded',
      justify: 'Modo cuadrícula',
    },
    {
      value: 'list',
      icon: 'material-symbols:lists',
      label: 'Modo lista',
    },
  ];

  viewSelected: string = 'grid';

  modalData!: {
    action: string;
    event: CalendarEvent;
  };

  events: CalendarEvent[] = [];

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  activeDayIsOpen: boolean = false;

  ngOnInit(): void {
    this.cols = [
      { field: 'title', header: 'Título' },
      { field: 'start', header: 'Fecha de inicio', align: 'center' },
      { field: 'end', header: 'Fecha de fin', align: 'center' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.cargarFeriados();
  }

  cargarFeriados() {
    this.feriadoService.findAllByMonth(this.viewDate).subscribe({
      next: (data) => {
        this.events = data.map((item) => ({
          id: item.id,
          title: item.title,
          start: new Date(item.start),
          end: item.end ? new Date(item.end) : undefined,
          color: { ...colors['blue'] },
          allDay: true,
        }));
      },
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    const ref = this.dialogService.open(FormEventoComponent, {
      header: 'Nuevo feriado',
      styleClass: 'modal-md',
      position: 'center',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarFeriados();
      }
    });
  }

  deleteEvent(item: CalendarEvent) {
    console.log('eventToDelete', item);
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el evento <span class='uppercase font-bold'>${item?.title}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        // this.events = this.events.filter((event) => event !== eventToDelete);
        this.feriadoService.delete(item.id as string).subscribe((res) => {
          this.cargarFeriados();
        });
        // this.store.delete(item.id);
      }
    );
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.cargarFeriados();
  }
}
