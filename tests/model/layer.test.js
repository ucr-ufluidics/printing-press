const Layer = require('../../model/layer.js');
const Component = require('../../model/component.js');
const Connection = require('../../model/connection.js');
const Port = require('../../model/port.js');
const Coord = require('../../model/coord.js');
const Terminal = require('../../model/terminal.js');
const ConnectionSegment = require('../../model/connection-segment.js');
const ComponentFeature = require('../../model/component-feature.js');
const Validation = require('../../utils/validation.js');

// Suppress console logs
console.log = jest.fn();


var port0_0 = new Port('port-0_0-label', new Coord(0, 0));
var port0_5 = new Port('port-0_5-label', new Coord(0, 5));
var port5_0 = new Port('port-5_0-label', new Coord(5, 0));
var port10_0 = new Port('port-10_0-label', new Coord(10, 0));

var compFeat00 = new ComponentFeature(new Coord(0, 0), 10);
var compFeat5050 = new ComponentFeature(new Coord(50, 50), 3);
var compFeat9090 = new ComponentFeature(new Coord(90, 90), 2);
var compFeat040 = new ComponentFeature(new Coord(0, 40), 123);

var component1 = new Component('comp-1-name', 'unique-id-comp-1', 20, 25, 'entity-1',
        [port0_0, port0_5], [compFeat00, compFeat5050]);
var component2 = new Component('comp-2-name', 'unique-id-comp-2', 30, 35, 'entity-2',
        [port5_0, port10_0], [compFeat9090, compFeat040]);
var component3 = new Component('comp-3-name', 'unique-id-comp-3', 5, 5, 'entity-3',
        [port0_0, port5_0]);

var sourceTerm1 = new Terminal(component1, port0_0);
var sourceTerm2 = new Terminal(component2, port5_0);
var sinkTerm1 = new Terminal(component2, port10_0);
var sinkTerm2 = new Terminal(component1, port0_5);
var invalidTerm = new Terminal(component3);
var segment1 = new ConnectionSegment('name-1', 'unique-id-seg-1', 5, 10, new Coord(6, 7), new Coord(6, 14));
var segment2 = new ConnectionSegment('name-2', 'unique-id-seg-2', 5, 10, new Coord(6, 14), new Coord(3, 14));
var segment3 = new ConnectionSegment('name-3', 'unique-id-seg-3', 5, 10, new Coord(0, 0), new Coord(1, 1));
var segment4 = new ConnectionSegment('name-4', 'unique-id-seg-4', 5, 10, new Coord(1, 1), new Coord(2, 2));

var connection1 = new Connection('conn-1-name', 'unique-id-conn-1', sourceTerm1, [sinkTerm1],
        [segment1, segment2]);
var connection2 = new Connection('conn-2-name', 'unique-id-conn-2', sourceTerm2, [sinkTerm2],
        [segment3, segment4]);

describe('initialization', () => {
    describe('constructor', () => {
        test('parameters', () => {
            let layer = new Layer('layer-name', 'layer-id', [component1, component2], [connection1, connection2]);

            expect(layer.name).toBe('layer-name');
            expect(layer.id).toBe('layer-id');
            expect(layer.components).toEqual([component1, component2]);
            expect(layer.connections).toEqual([connection1, connection2]);
        });

        test('default', () => {
            let l = new Layer();

            expect(l.name).toBe(Validation.DEFAULT_STR_VALUE);
            expect(l.id).toBe(Validation.DEFAULT_STR_VALUE);
            expect(l.components).toEqual([]);
            expect(l.connections).toEqual([]);
        });
    });

    test('modify fields', () => {
        let layer = new Layer('layer-name', 'layer-id');

        layer.name = 'new-layer-name';
        layer.id = 'new-layer-id';
        layer.components = [component1, component2];
        layer.connections = [connection1, connection2];

        expect(layer.name).toBe('new-layer-name');
        expect(layer.id).toBe('new-layer-id');
        expect(layer.components).toEqual([component1, component2]);
        expect(layer.connections).toEqual([connection1, connection2]);
    });
});

describe('validation', () => {
    describe('invalid', () => {
        test('all fields', () => {
            let badBothLayer = new Layer(Validation.DEFAULT_STR_VALUE, Validation.DEFAULT_STR_VALUE);

            expect(badBothLayer.validate()).toBe(false);
        });

        test('name', () => {
            let badNameLayer = new Layer(Validation.DEFAULT_STR_VALUE, 'id', [component1, component2],
                    [connection1, connection2]);

            expect(badNameLayer.validate()).toBe(false);
        });

        test('id', () => {
            let badIDLayer = new Layer('name', Validation.DEFAULT_STR_VALUE, [component1, component2],
                    [connection1, connection2]);

            expect(badIDLayer.validate()).toBe(false);
        });

        test('components', () => {
            let l = new Layer('name', 'id', [new Component(), component2], [connection1, connection2]);

            expect(l.validate()).toBe(false);
        });

        test('connections', () => {
            let l = new Layer('name', 'id', [component1, component2], [new Connection(), connection2]);

            expect(l.validate()).toBe(false);
        });

        describe('mismatched component', () => {
            test('source', () => {
                let con = new Connection('bad-connection', 'unique-bad-con-id', invalidTerm, [sinkTerm1, sinkTerm2]);
                console.log('HERE IT IS: (inv, con): (' + invalidTerm + ', ' + con.source + ')');
                let l = new Layer('name', 'id', [component1, component2], [con]);

                expect(l.validate()).toBe(false);
            });

            test('sink', () => {
                let con = new Connection('bad-connection', 'unique-con-id', sourceTerm1, [invalidTerm]);
                let l = new Layer('name', 'id', [component1, component2], [con]);

                expect(l.validate()).toBe(false);
            });
        });
    });

    test('valid', () => {
        let goodLayer = new Layer('good-name', 'good-id', [component1, component2], [connection1, connection2]);

        expect(goodLayer.validate()).toBe(true);
    });
});
