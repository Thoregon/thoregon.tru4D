/**
 * Nameservice handler for Bounded Contexts (Instances)
 *
 * handles urn's for bounded contexts.
 * these urn's starts with 'bc:' for permissioned BC's
 * and starts with 'pubbc:' for public BC's
 *
 * the enquirer must have access permissions to get the bc root
 * this is ensured by encrypted entries, for public bc's the entry is not encrypted
 *
 * urn's must have at least two path elements e.g.:
 *  '/mygroup/mybc'
 *
 * Don't use known names for the group like google, apple, amazon or ibm.
 * You will get in trouble!
 *
 * Entry for BC in KARTE
 *  {
 *      entry: {
 *          name: 'Name of BoundedContext',
 *          nodes: [        // there must be at least a 'main' node
 *              {
 *                  type: 'main',
 *                  path: 'path to node in matter db'
 *              },
 *          ...
 *          ]
 *      }
 *  }
 *
 *  in case of a permissioned BC, the entry is encrypted.
 *  {
 *      permissions: {
 *          pub: <public key of the BC>,
 *          roles: [
 *            {
 *              role: <role for permission>,
 *              key: <encrypted key to decrypt the entry>
 *            }
 *          ],
 *      },
 *      entry : <encrypted entry>
 *  }
 *
 *  to descrypt the key, you need to have the roles keypair.
 *  with this keypair and the public key a DH secret can be generated
 *  which can be used to decrypt the key. with the key you can decrypt
 *  and verify the entry.
 *
 *  The firewall adapter accepts only writes to permissions and entry
 *  which are signed from the BC owner with the BC's private key.
 *
 * @author: Bernhard Lukassen
 */

const BCROOT    = 'NLF6xxQM84TablXKJtihHBsN';

const BC        = 'bc:';

const dbroot    = universe.matter;

export default class KarteBCHandler {

    matches(urn) {
        return urn.startsWith(BC) || urn.startsWith(PUBBC);
    }

    async lookup(urn, karte) {
        if (!urn.startsWith(BC)) return;
        let path = isPublic ? urn.substr(PUBBC.length) : urn.substr(BC.length);
        let addresspath = this.materialNode(isPublic, path);
        let entry = await addresspath.val;

        return false;
    }

    registerBoundedContext(path, karte, boundedContext, isPublic = false) {

    }

    registerPublicBoundedContext(path, karte, boundedContext) {
        return this.registerBoundedContext(path, karte, boundedContext, true);
    }

    /*
     * internals
     */

    materialNode(isPublic, path) {
        if (!path.startsWith('/')) path += path;
        let addresspath = `${isPublic ? PUBBCROOT : BCROOT}.${path.replaceAll(/\//g, '.')}`;
        return dbroot.path(addresspath);
    }

}
