import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TextareaModule } from 'primeng/textarea';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Icon, Style } from 'ol/style';
import Translate from 'ol/interaction/Translate';
import Collection from 'ol/Collection';
import { OpenStreetService } from '@services/open-street.service';
import { Sede } from '@models/sede.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Ciudad, Pais, Provincia, Region } from '@models/nacionalidad.model';
import { SedeStore } from '@stores/sede.store';
import { MessageGlobalService } from '@services/message-global.service';
import { NacionalidadStore } from '@stores/nacionalidad.store';
import { sanitizedForm } from '@functions/forms.function';

@Component({
  selector: 'app-form-sedes',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    SelectModule,
    AutoCompleteModule,
    TextareaModule,
    ToggleSwitchModule,
  ],
  templateUrl: './form-sedes.component.html',
  styles: ``,
})
export class FormSedesComponent implements AfterViewInit, OnInit, OnDestroy {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly openStreetService: OpenStreetService =
    inject(OpenStreetService);

  readonly store = inject(SedeStore);

  readonly nacStore = inject(NacionalidadStore);

  direccionItems: any[] = [];

  private map!: Map;
  private marker!: Feature<Point>;
  querySearch: any;

  formData = new FormGroup({
    nombre: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ruc: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    razonSocial: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idRegion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idProvincia: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idCiudad: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    direccion: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    latitud: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    longitud: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isActive: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  paisDefault!: Pais;

  get listaRegiones(): Region[] {
    return this.nacStore.regiones();
  }

  get listaProvincias(): Provincia[] {
    return this.nacStore.provincias();
  }

  get listaCiudades(): Ciudad[] {
    return this.nacStore.ciudades();
  }

  id: string | undefined;

  get loading(): boolean {
    return this.store.loading();
  }

  private paisEffect = effect(() => {
    const pais = this.nacStore.pais();
    if (pais) {
      this.paisDefault = pais;
      this.cargarRegiones();
    }
  });

  private resetOnSuccessEffect = effect(() => {
    const { selectedItem, error, lastAction } = this.store;

    const item = selectedItem();
    const action = lastAction();
    const currentError = error();

    // Manejo de errores
    if (currentError) {
      console.log('error', error);
      this.msg.error(
        currentError ??
          '¡Ups, ocurrió un error inesperado al guardar el edificio!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Edificio creado exitosamente!'
          : '¡Edificio actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && item.id != this.id) {
      this.id = item.id ?? null;
      const idRegion = item.ciudad?.province?.idState;
      const idProvincia = item.ciudad?.idProvince;
      this.formData.setValue({
        nombre: item.nombre,
        direccion: item.direccion,
        ruc: item.ruc,
        razonSocial: item.razonSocial,
        latitud: item.latitud,
        longitud: item.longitud,
        idCiudad: item.idCiudad,
        idProvincia: item.ciudad?.idProvince,
        idRegion: item.ciudad?.province?.idState,
        isActive: item.isActive,
      });

      this.cargarProvincias(idRegion!);
      this.cargarCiudades(idProvincia!);
    }
  });

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.paisEffect.destroy();
    this.resetOnSuccessEffect.destroy();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.marker = new Feature({
      geometry: new Point(fromLonLat([-77.0428, -12.0464])), // Londres
    });

    this.marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: '/marker.png',
          scale: 0.075,
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [this.marker],
    });

    const markerLayer = new VectorLayer({
      source: vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([-77.0428, -12.0464]),
        zoom: 10,
      }),
    });

    // Interacción para mover el marcador
    const translate = new Translate({
      features: new Collection([this.marker]),
    });

    this.map.addInteraction(translate);

    // Opcional: escuchar cuando se mueva
    translate.on('translateend', (event) => {
      const geometry = this.marker.getGeometry() as Point;
      const coords = geometry.getCoordinates();
      const coor = toLonLat(coords);
      const lon = coor[0].toFixed(8);
      const lat = coor[1].toFixed(8);
      this.getAddressFromCoords(lat, lon);
    });
  }

  get isActive(): boolean {
    return this.formData.get('isActive')?.value as boolean;
  }

  cargarRegiones() {
    this.nacStore.getRegiones(this.paisDefault?.id!);
  }

  cargarProvincias(idRegion: string) {
    this.nacStore.getProvincias(idRegion);
  }

  cargarCiudades(idProvincia: string) {
    this.nacStore.getCiudades(idProvincia);
  }

  onSelect(event: AutoCompleteSelectEvent) {
    const { label, lat, lon } = event.value;
    this.formData.get('direccion')?.setValue(label);
    this.formData.get('latitud')?.setValue(parseFloat(lat).toFixed(8));
    this.formData.get('longitud')?.setValue(parseFloat(lon).toFixed(8));
    this.moverMapa(parseFloat(lat), parseFloat(lon));
  }

  buscarDireccion(event: AutoCompleteCompleteEvent) {
    let query = '';
    if (this.querySearch === event.query) {
      query = event.query;
    } else {
      query = this.querySearch?.label ?? '';
    }
    if (query.length >= 2) {
      this.openStreetService.searchByDirection(query).subscribe((data) => {
        this.direccionItems = data.map((item: any) => ({
          label: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
      });
    } else {
      this.direccionItems = [];
    }
  }

  // 🟢 Buscar por coordenadas (mover el mapa a una lat/lng)
  buscarCoordenadas(lat: number, lon: number) {
    this.moverMapa(lat, lon);
  }

  // 🟢 Mueve el mapa y coloca un marcador
  private moverMapa(lat: number, lon: number) {
    const coords = fromLonLat([lon, lat]);
    this.map.getView().setCenter(coords);
    this.map.getView().setZoom(18);

    const geometry = this.marker.getGeometry();
    geometry?.setCoordinates(coords);
  }

  private getAddressFromCoords(lat: string, lon: string): void {
    this.openStreetService
      .getAddressFromCoords(lat, lon)
      .subscribe((data: any) => {
        this.formData.get('direccion')?.setValue(data.display_name);
        this.formData.get('latitud')?.setValue(lat);
        this.formData.get('longitud')?.setValue(lon);
      });
  }

  guardar() {
    const { idRegion, idProvincia, ...form } = sanitizedForm(
      this.formData.getRawValue()
    );
    if (this.id) {
      this.store.update(this.id, { ...form, id: this.id } as Sede);
    } else {
      this.store.create(form as Sede);
    }
  }
}
