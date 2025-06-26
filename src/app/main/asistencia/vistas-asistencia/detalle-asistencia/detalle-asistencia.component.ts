import { AfterViewInit, Component, inject, OnInit } from '@angular/core';

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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { MessageGlobalService } from '@services/message-global.service';

@Component({
  selector: 'app-detalle-asistencia',
  imports: [CommonModule],
  templateUrl: './detalle-asistencia.component.html',
  styles: ``,
})
export class DetalleAsistenciaComponent implements AfterViewInit, OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private map!: Map;
  private marker!: Feature<Point>;
  private markerIn!: Feature<Point>;
  private markerOu!: Feature<Point>;
  trabajador: any = null; // Aquí puedes definir el tipo correcto según tu modelo
  marcacion: any = null; // Aquí puedes definir el tipo correcto según tu modelo

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance?.data;
    if (data) {
      this.trabajador = data.trabajador || null;
      this.marcacion = data.marcacion || null;
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
    if (this.trabajador) {
      const sede = this.trabajador.sede;

      if (sede.latitud && sede.longitud) {
        this.moverMapa(sede.latitud, sede.longitud);
      }
    }
    if (this.marcacion) {
      const latEntrada = this.marcacion?.asistencia?.latitudEntrada;
      const lonEntrada = this.marcacion?.asistencia?.longitudEntrada;
      const latSalida = this.marcacion?.asistencia?.latitudSalida;
      const lonSalida = this.marcacion?.asistencia?.longitudSalida;

      console.log('Latitud Entrada:', latEntrada);
      console.log('Longitud Entrada:', lonEntrada);

      if (latEntrada && lonEntrada) {
        this.markerIn = new Feature({
          geometry: new Point(fromLonLat([lonEntrada, latEntrada])),
        });

        this.markerIn.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: '/gps-green.png',
              scale: 0.05,
            }),
          })
        );

        const vectorSourceIn = new VectorSource({
          features: [this.markerIn],
        });

        const markerLayerIn = new VectorLayer({
          source: vectorSourceIn,
        });

        this.map.addLayer(markerLayerIn);
      }

      if (latSalida && lonSalida) {
        this.markerOu = new Feature({
          geometry: new Point(fromLonLat([lonSalida, latSalida])),
        });

        this.markerOu.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: '/gps-red.png',
              scale: 0.05,
            }),
          })
        );

        const vectorSourceOu = new VectorSource({
          features: [this.markerOu],
        });

        const markerLayerOu = new VectorLayer({
          source: vectorSourceOu,
        });

        this.map.addLayer(markerLayerOu);
      }
    }
  }

  private initMap(): void {
    this.marker = new Feature({
      geometry: new Point(fromLonLat([-77.0428, -12.0464])), // Londres
    });

    this.marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: '/house.png',
          scale: 0.05,
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
    // const translate = new Translate({
    //   features: new Collection([this.marker]),
    // });

    // this.map.addInteraction(translate);

    // // Opcional: escuchar cuando se mueva
    // translate.on('translateend', (event) => {
    //   const geometry = this.marker.getGeometry() as Point;
    //   const coords = geometry.getCoordinates();
    //   const coor = toLonLat(coords);
    //   const lon = coor[0].toFixed(8);
    //   const lat = coor[1].toFixed(8);
    // });
  }

  private moverMapa(lat: number, lon: number) {
    const coords = fromLonLat([lon, lat]);
    this.map.getView().setCenter(coords);
    this.map.getView().setZoom(18);

    const geometry = this.marker.getGeometry();
    geometry?.setCoordinates(coords);
  }

  centrarEdificio() {
    if (this.marker) {
      const coords = this.marker.getGeometry()?.getCoordinates();
      if (coords) {
        this.map.getView().setCenter(coords);
        this.map.getView().setZoom(18);
      }
    } else {
      this.msg.error('No se encontraron las coordenadas del edificio.');
    }
  }
  centrarEntrada() {
    if (this.markerIn) {
      const coords = this.markerIn.getGeometry()?.getCoordinates();
      if (coords) {
        this.map.getView().setCenter(coords);
        this.map.getView().setZoom(18);
      }
    } else {
      this.msg.warn(
        'No se encontraron la marcación de entrada.'
      );
    }
  }
  centrarSalida() {
    if (this.markerOu) {
      const coords = this.markerOu.getGeometry()?.getCoordinates();
      if (coords) {
        this.map.getView().setCenter(coords);
        this.map.getView().setZoom(18);
      }
    } else {
      this.msg.warn(
        'No se encontraron la marcación de salida.'
      );
    }
  }
}
